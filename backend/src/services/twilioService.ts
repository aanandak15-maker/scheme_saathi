
import twilio from 'twilio';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { supabase } from './supabaseClient';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Initialize Twilio client (only if credentials exist)
let twilioClient: twilio.Twilio | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN &&
    TWILIO_ACCOUNT_SID !== 'your-twilio-sid') {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * State machine for the 9-step IVR conversation flow
 */
export type IVRStep =
    | 'welcome'           // Step 1: Greeting
    | 'category_menu'     // Step 2: Scheme category (1=Farmer, 2=Housing, 3=Labor)
    | 'collect_name'      // Step 3: "Apna naam boliye"
    | 'collect_age'       // Step 4: "Aapki umra kya hai?"
    | 'collect_occupation' // Step 5: "Kya aap kisaan hain?"
    | 'collect_land'      // Step 6: "Kitni zameen hai?" (if farmer)
    | 'check_eligibility' // Step 7: Run engine + speak results
    | 'send_sms'          // Step 8: Send SMS confirmation
    | 'csc_prompt'        // Step 9: "CSC se milne ke liye 1 dabayein"
    | 'goodbye';

export interface CallState {
    callSid: string;
    callerNumber: string;
    category: string;
    name: string;
    age: string;
    state: string;
    occupation: string;
    landAcres: string;
    housingType: string;
}

export class TwilioService {

    // ─── TwiML Helpers ────────────────────────────────────

    /**
     * Build a Play URL for Sarvam TTS.
     * Twilio will fetch this URL and stream the audio to the caller.
     */
    public static ttsPlayUrl(text: string, lang: string = 'hi-IN'): string {
        return `${BACKEND_URL}/api/voice/tts-stream?text=${encodeURIComponent(text)}&lang=${lang}`;
    }

    /**
     * Speak text using Sarvam TTS via <Play>, with <Say> fallback.
     * In demo/local mode (no public URL), uses Polly.Aditi directly.
     */
    public static speak(twiml: VoiceResponse, text: string, lang: string = 'hi-IN') {
        const isProduction = BACKEND_URL.includes('ngrok') || BACKEND_URL.includes('https');

        if (isProduction) {
            // Use Sarvam AI via streaming endpoint
            twiml.play(this.ttsPlayUrl(text, lang));
        } else {
            // Fallback: Twilio's built-in Hindi voice
            twiml.say({ language: lang as any, voice: 'Polly.Aditi' }, text);
        }
    }

    /**
     * Build a redirect URL carrying IVR state via query params
     */
    public static buildStepUrl(step: IVRStep, state: Partial<CallState>): string {
        const params = new URLSearchParams();
        params.set('step', step);
        if (state.callSid) params.set('callSid', state.callSid);
        if (state.callerNumber) params.set('caller', state.callerNumber);
        if (state.category) params.set('category', state.category);
        if (state.name) params.set('name', state.name);
        if (state.age) params.set('age', state.age);
        if (state.state) params.set('state', state.state);
        if (state.occupation) params.set('occupation', state.occupation);
        if (state.landAcres) params.set('land', state.landAcres);
        if (state.housingType) params.set('housing', state.housingType);
        return `/api/twilio/voice-gather?${params.toString()}`;
    }

    /**
     * Extract call state from request query/body
     */
    public static extractState(req: any): Partial<CallState> {
        const q = { ...req.query, ...req.body };
        return {
            callSid: q.CallSid || q.callSid || '',
            callerNumber: q.From || q.caller || '',
            category: q.category || '',
            name: q.name || '',
            age: q.age || '',
            state: q.state || '',
            occupation: q.occupation || '',
            landAcres: q.land || '',
            housingType: q.housing || '',
        };
    }

    // ─── SMS ──────────────────────────────────────────────

    /**
     * Send SMS with eligibility results
     */
    public static async sendSMS(to: string, body: string): Promise<boolean> {
        if (!twilioClient) {
            console.log(`📱 [MOCK SMS] To: ${to}\n${body}`);
            return true; // Mock success
        }

        try {
            const message = await twilioClient.messages.create({
                body,
                from: TWILIO_PHONE_NUMBER,
                to,
            });
            console.log(`📱 SMS sent: ${message.sid} → ${to}`);
            return true;
        } catch (error) {
            console.error('SMS Error:', error);
            return false;
        }
    }

    /**
     * Format eligibility results for SMS
     */
    public static formatSMSBody(
        name: string,
        eligibleSchemes: Array<{ scheme_name: string; portal_url?: string }>,
        documents: string[],
        nearestCSC: string = 'Apne nazdeeki CSC center'
    ): string {
        let msg = `Namaste ${name}! Scheme Saathi se aapke results:\n\n`;

        if (eligibleSchemes.length > 0) {
            msg += `✅ Aap in schemes ke liye yogya hain:\n`;
            eligibleSchemes.forEach((s, i) => {
                msg += `${i + 1}. ${s.scheme_name}`;
                if (s.portal_url) msg += `\n   🔗 ${s.portal_url}`;
                msg += '\n';
            });
        } else {
            msg += `❌ Abhi koi scheme match nahi hui.\n`;
        }

        if (documents.length > 0) {
            msg += `\n📄 Zaruri Documents:\n`;
            documents.forEach(d => { msg += `• ${d}\n`; });
        }

        msg += `\n📍 ${nearestCSC} par jaayein.\n`;
        msg += `\nScheme Saathi - Sarkari Yojana Sahayak`;

        return msg;
    }


    // ─── Database Logging (Supabase) ─────────────────────

    /**
     * Create or update citizen profile based on phone number
     */
    public static async createOrUpdateCitizen(phoneNumber: string, data: any = {}) {
        const { error } = await supabase
            .from('citizen_profiles')
            .upsert({
                citizen_id: phoneNumber, // Use phone number as ID for consistency
                mobile_number: phoneNumber,
                full_name: data.name || 'Unknown Caller',
                age: parseInt(data.age) || undefined,
                updated_at: new Date().toISOString(),
                // Merge other JSON fields if needed
            }, { onConflict: 'citizen_id' });

        if (error) console.error('DB Error (Citizen):', error);
    }

    /**
     * Log call start
     */
    public static async logCallStart(callSid: string, from: string) {
        // Ensure citizen exists first (FK constraint)
        await this.createOrUpdateCitizen(from);

        const { error } = await supabase
            .from('call_logs')
            .insert({
                twilio_sid: callSid,
                citizen_id: from,
                from_number: from,
                status: 'started',
                transcript: 'Call started...',
                created_at: new Date().toISOString()
            });

        if (error) console.error('DB Error (Log Start):', error);
    }

    /**
     * Update call log status
     */
    public static async logCallUpdate(callSid: string, status: string, details: any = {}) {
        const updateData: any = { status };
        if (details.transcript) updateData.transcript = details.transcript;
        if (details.eligibility) updateData.eligibility_snapshot = details.eligibility;

        const { error } = await supabase
            .from('call_logs')
            .update(updateData)
            .eq('twilio_sid', callSid);

        if (error) console.error('DB Error (Log Update):', error);
    }

    /**
     * Log call (Console + DB wrapper)
     */
    public static logCall(callSid: string, step: string, data: any) {
        console.log(`📞 [${callSid}] Step: ${step}`, JSON.stringify(data));
        // We could also log every step to DB, but 'start' and 'end' is usually sufficient.
    }


    // ─── Hindi IVR Messages ───────────────────────────────

    public static readonly MESSAGES = {
        welcome: 'Namaste! Scheme Saathi mein aapka swagat hai. ' +
            'Hum aapko sarkari yojanaaon mein madad karenge.',

        categoryMenu: 'Kripya apni category chunein: ' +
            '1 dabayein Kisan yojanaaon ke liye. ' +
            '2 dabayein Aawas yojanaaon ke liye. ' +
            '3 dabayein Mazdoor yojanaaon ke liye.',

        askName: 'Kripya beep ke baad apna poora naam boliye.',

        askAge: (name: string) =>
            `Dhanyavaad ${name} ji. Aapki umra kya hai? Kripya keypad par type karein.`,

        askOccupation: 'Aapka mukhya kaam kya hai? ' +
            '1 dabayein Kisan ke liye. ' +
            '2 dabayein Mazdoor ke liye. ' +
            '3 dabayein Vidyarthi ke liye. ' +
            '4 dabayein Anya ke liye.',

        askLand: 'Aapke paas kitni zameen hai hectare mein? Kripya keypad par type karein.',

        askHousing: 'Aapka ghar kaisa hai? ' +
            '1 dabayein Kachcha ghar ke liye. ' +
            '2 dabayein Pucca ghar ke liye. ' +
            '3 dabayein Koi ghar nahi.',

        processing: 'Dhanyavaad. Hum aapki yogyata check kar rahe hain. Kripya pratiksha karein.',

        eligible: (schemeName: string) =>
            `Badhaai ho! Aap ${schemeName} ke liye yogya hain.`,

        notEligible: 'Maaf kijiye, abhi aap kisi scheme ke liye yogya nahi hain. ' +
            'Lekin chinta mat karein, aur yojanaayen aa sakti hain.',

        smsSent: 'Humne aapke phone par SMS bhej diya hai. Usme saari details hain.',

        cscPrompt: 'Agar aap nazdeeki CSC center ka pata jaanna chahte hain, toh 1 dabayein. ' +
            'Call khatam karne ke liye 2 dabayein ya phone rakh dein.',

        cscInfo: 'Apne nazdeeki Jan Seva Kendra par jaayein. Woh aapki apply karne mein madad karenge. ' +
            'Apne saare documents lekar jaana na bhoolein.',

        goodbye: 'Scheme Saathi ka upyog karne ke liye dhanyavaad. Namaste!',

        error: 'Maaf kijiye, kuch galat ho gaya. Kripya dobara call karein.',

        notHeard: 'Maaf kijiye, main sun nahi paya. Kripya dobara boliye.',

        timeout: 'Koi jawab nahi mila. Kripya dobara koshish karein.',
    };
}
