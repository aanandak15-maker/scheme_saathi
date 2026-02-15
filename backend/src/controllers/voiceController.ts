
import { Request, Response } from 'express';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { VoiceService } from '../services/voiceService';
import { TwilioService, CallState, IVRStep } from '../services/twilioService';
import { EligibilityEngine } from '../services/eligibilityEngine';
import fs from 'fs';
import path from 'path';
import { supabase } from '../services/supabaseClient';

// Load schemes data for eligibility checks
const schemesPath = path.join(__dirname, '../../data/master_schemes.json');
let schemesData: any[] = [];
try {
    schemesData = JSON.parse(fs.readFileSync(schemesPath, 'utf-8'));
} catch (e) {
    console.warn('⚠️ Could not load schemes_database.json for IVR. Will use fallback.');
}

// ═══════════════════════════════════════════════════════════
//  ENDPOINT 1: /api/twilio/voice-incoming
//  Handles incoming call → Welcome + Category menu
// ═══════════════════════════════════════════════════════════

export const handleVoiceIncoming = async (req: Request, res: Response) => {
    const twiml = new VoiceResponse();
    const callSid = req.body.CallSid || 'DEMO';
    const callerNumber = req.body.From || '+91XXXXXXXXXX';

    TwilioService.logCall(callSid, 'incoming', { from: callerNumber });
    // Database Log
    TwilioService.logCallStart(callSid, callerNumber).catch(console.error);

    try {
        // Step 1: Welcome
        TwilioService.speak(twiml, TwilioService.MESSAGES.welcome);

        // Step 2: Category Menu
        const gather = twiml.gather({
            input: ['dtmf'],
            numDigits: 1,
            timeout: 8,
            action: TwilioService.buildStepUrl('collect_name', {
                callSid,
                callerNumber,
            }),
        });
        TwilioService.speak(gather as any, TwilioService.MESSAGES.categoryMenu);

        // Timeout fallback → repeat
        twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, TwilioService.MESSAGES.timeout);
        twiml.redirect('/api/twilio/voice-incoming');

    } catch (error) {
        console.error('IVR Incoming Error:', error);
        twiml.say({ language: 'hi-IN' }, TwilioService.MESSAGES.error);
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
};

// ═══════════════════════════════════════════════════════════
//  ENDPOINT 2: /api/twilio/voice-gather
//  Multi-step <Gather> driven by ?step= query param
// ═══════════════════════════════════════════════════════════

export const handleVoiceGather = async (req: Request, res: Response) => {
    const twiml = new VoiceResponse();
    const step = (req.query.step || req.body.step || 'collect_name') as IVRStep;
    const state = TwilioService.extractState(req);

    TwilioService.logCall(state.callSid || 'DEMO', step, state);

    try {
        switch (step) {

            // ── Step 3: Collect Name ──────────────────────────
            case 'collect_name': {
                // Capture the category digit from the previous step
                const categoryDigit = req.body.Digits || state.category;
                let category = 'general';
                if (categoryDigit === '1') category = 'farmer';
                if (categoryDigit === '2') category = 'housing';
                if (categoryDigit === '3') category = 'labor';
                state.category = category;

                const gather = twiml.gather({
                    input: ['speech'],
                    language: 'hi-IN',
                    timeout: 5,
                    speechTimeout: 'auto' as any,
                    action: TwilioService.buildStepUrl('collect_age', state),
                });
                TwilioService.speak(gather as any, TwilioService.MESSAGES.askName);

                // Fallback if no speech detected
                twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, TwilioService.MESSAGES.notHeard);
                twiml.redirect(TwilioService.buildStepUrl('collect_name', state));
                break;
            }

            // ── Step 4: Collect Age ───────────────────────────
            case 'collect_age': {
                const speechResult = req.body.SpeechResult;
                if (speechResult) {
                    state.name = speechResult;
                }

                const gather = twiml.gather({
                    input: ['dtmf'],
                    numDigits: 2,
                    timeout: 10,
                    action: TwilioService.buildStepUrl('collect_occupation', state),
                });
                TwilioService.speak(gather as any, TwilioService.MESSAGES.askAge(state.name || 'Aap'));

                // Fallback
                twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, TwilioService.MESSAGES.timeout);
                twiml.redirect(TwilioService.buildStepUrl('collect_age', state));
                break;
            }

            // ── Step 5: Collect Occupation ────────────────────
            case 'collect_occupation': {
                const ageDigits = req.body.Digits;
                if (ageDigits) {
                    state.age = ageDigits;
                }

                const gather = twiml.gather({
                    input: ['dtmf'],
                    numDigits: 1,
                    timeout: 8,
                    action: TwilioService.buildStepUrl('collect_land', state),
                });
                TwilioService.speak(gather as any, TwilioService.MESSAGES.askOccupation);

                twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, TwilioService.MESSAGES.timeout);
                twiml.redirect(TwilioService.buildStepUrl('collect_occupation', state));
                break;
            }

            // ── Step 6: Collect Land Details (if farmer) ─────
            case 'collect_land': {
                const occDigit = req.body.Digits;
                let occupation = 'Other';
                if (occDigit === '1') occupation = 'Farmer';
                if (occDigit === '2') occupation = 'Construction Worker';
                if (occDigit === '3') occupation = 'Student';
                state.occupation = occupation;

                if (occupation === 'Farmer' || state.category === 'farmer') {
                    // Ask for land
                    const eligUrl = buildEligibilityUrl(state);
                    const gather = twiml.gather({
                        input: ['dtmf'],
                        numDigits: 2,
                        timeout: 10,
                        action: eligUrl,
                    });
                    TwilioService.speak(gather as any, TwilioService.MESSAGES.askLand);

                    twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, TwilioService.MESSAGES.timeout);
                    twiml.redirect(TwilioService.buildStepUrl('collect_land', state));
                } else if (state.category === 'housing') {
                    // Ask for housing type
                    const eligUrl2 = buildEligibilityUrl(state);
                    const gather = twiml.gather({
                        input: ['dtmf'],
                        numDigits: 1,
                        timeout: 8,
                        action: eligUrl2,
                    });
                    TwilioService.speak(gather as any, TwilioService.MESSAGES.askHousing);

                    twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, TwilioService.MESSAGES.timeout);
                    twiml.redirect(TwilioService.buildStepUrl('collect_land', state));
                } else {
                    // Skip land/housing → go straight to eligibility
                    twiml.redirect(buildEligibilityUrl(state));
                }
                break;
            }

            default:
                twiml.say({ language: 'hi-IN' }, TwilioService.MESSAGES.error);
                twiml.hangup();
        }

    } catch (error) {
        console.error(`IVR Gather Error [${step}]:`, error);
        twiml.say({ language: 'hi-IN' }, TwilioService.MESSAGES.error);
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
};

// ═══════════════════════════════════════════════════════════
//  ENDPOINT 3: /api/twilio/voice-eligibility
//  Run engine → Speak results → SMS → CSC prompt → Hangup
// ═══════════════════════════════════════════════════════════

export const handleVoiceEligibility = async (req: Request, res: Response) => {
    const twiml = new VoiceResponse();
    const state = TwilioService.extractState(req);

    // Capture final input (land acres or housing type)
    const lastDigits = req.body.Digits;
    if (state.occupation === 'Farmer' || state.category === 'farmer') {
        state.landAcres = lastDigits || '0';
    } else if (state.category === 'housing') {
        const housingMap: Record<string, string> = { '1': 'Kutcha', '2': 'Pucca', '3': 'None' };
        state.housingType = housingMap[lastDigits] || 'Unknown';
    }

    TwilioService.logCall(state.callSid || 'DEMO', 'eligibility', state);

    try {
        // Step 7: Processing message
        TwilioService.speak(twiml, TwilioService.MESSAGES.processing);

        // Build citizen profile from collected data
        const profile = buildProfileFromState(state);

        // Run Eligibility Engine
        const engineResult = EligibilityEngine.evaluate(profile, schemesData);
        const eligibleSchemes = engineResult.eligible_schemes || [];

        // ─── Database Persistence ─────────────────────────
        const callerNumber = state.callerNumber || '';
        if (callerNumber && callerNumber !== '+91XXXXXXXXXX') {
            // 1. Update Citizen Profile
            await TwilioService.createOrUpdateCitizen(callerNumber, {
                name: state.name,
                age: state.age
            });

            // 2. Save Eligibility Result
            const { error: resError } = await supabase
                .from('eligibility_results')
                .insert({
                    citizen_id: callerNumber, // Phone as ID
                    scheme_id: eligibleSchemes.length > 0 ? eligibleSchemes[0].scheme_id : null,
                    is_eligible: eligibleSchemes.length > 0,
                    eligibility_score: eligibleSchemes.length > 0 ? eligibleSchemes[0].score : 0,
                    reasoning: eligibleSchemes.length > 0 ? eligibleSchemes[0].reasoning : ['No eligible schemes found'],
                    missing_documents: eligibleSchemes.length > 0 ? [] : engineResult.missing_documents, // Simplified
                    created_at: new Date().toISOString()
                });

            if (resError) console.error('DB Error (Elig Result):', resError);

            // 3. Update Call Log
            await TwilioService.logCallUpdate(state.callSid || '', 'completed', {
                eligibility: {
                    eligible_count: eligibleSchemes.length,
                    top_scheme: eligibleSchemes[0]?.scheme_name
                }
            });
        }
        // ──────────────────────────────────────────────────

        if (eligibleSchemes.length > 0) {
            // Announce eligible schemes
            for (const scheme of eligibleSchemes.slice(0, 3)) { // Max 3 to keep call short
                const schemeName = scheme.scheme_name || scheme.scheme_id;
                TwilioService.speak(twiml, TwilioService.MESSAGES.eligible(schemeName));
            }
        } else {
            TwilioService.speak(twiml, TwilioService.MESSAGES.notEligible);
        }

        // Step 8: SMS
        TwilioService.speak(twiml, TwilioService.MESSAGES.smsSent);

        // Fire SMS asynchronously (don't block TwiML response)
        if (callerNumber && callerNumber !== '+91XXXXXXXXXX') {
            const schemeDetails = eligibleSchemes.map((s: any) => ({
                scheme_name: s.scheme_name || s.scheme_id,
                portal_url: schemesData.find((sd: any) => sd.scheme_id === s.scheme_id)?.portal_url
            }));
            const documents = eligibleSchemes.flatMap((s: any) => s.missing_documents || []);
            const smsBody = TwilioService.formatSMSBody(state.name || 'User', schemeDetails, documents);
            TwilioService.sendSMS(callerNumber, smsBody).catch(console.error);
        }

        // Step 9: CSC prompt
        const gather = twiml.gather({
            input: ['dtmf'],
            numDigits: 1,
            timeout: 5,
            action: '/api/twilio/voice-csc',
        });
        TwilioService.speak(gather as any, TwilioService.MESSAGES.cscPrompt);

        // Default: goodbye
        TwilioService.speak(twiml, TwilioService.MESSAGES.goodbye);
        twiml.hangup();

    } catch (error) {
        console.error('IVR Eligibility Error:', error);
        twiml.say({ language: 'hi-IN' }, TwilioService.MESSAGES.error);
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
};

// ═══════════════════════════════════════════════════════════
//  ENDPOINT: /api/twilio/voice-csc
//  CSC information response
// ═══════════════════════════════════════════════════════════

export const handleVoiceCSC = async (req: Request, res: Response) => {
    const twiml = new VoiceResponse();
    const digit = req.body.Digits;

    if (digit === '1') {
        TwilioService.speak(twiml, TwilioService.MESSAGES.cscInfo);
    }

    TwilioService.speak(twiml, TwilioService.MESSAGES.goodbye);
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
};

// ═══════════════════════════════════════════════════════════
//  ENDPOINT: /api/voice/tts-stream
//  Serves Sarvam AI TTS audio for Twilio <Play>
// ═══════════════════════════════════════════════════════════

export const handleTTSStream = async (req: Request, res: Response) => {
    const text = req.query.text as string;
    const lang = (req.query.lang as string) || 'hi-IN';

    if (!text) {
        return res.status(400).send('Missing text parameter');
    }

    try {
        const audioBuffer = await VoiceService.textToSpeechBuffer(text, lang);
        res.type('audio/wav');
        res.set('Content-Length', String(audioBuffer.length));
        res.send(audioBuffer);
    } catch (error) {
        console.error('TTS Stream Error:', error);
        // Return silence (1 second of WAV silence) so Twilio doesn't error
        res.status(500).send('TTS failed');
    }
};

// ═══════════════════════════════════════════════════════════
//  ENDPOINT: /api/voice-input (existing, kept for web API)
// ═══════════════════════════════════════════════════════════

export const handleVoiceInput = async (req: Request, res: Response) => {
    try {
        const { audioLink, textInput } = req.body;
        let finalText = textInput;
        let detectedLang = 'en-IN';

        if (req.file) {
            try {
                const result = await VoiceService.speechToText(req.file.buffer, req.file.mimetype);
                finalText = result.text;
                detectedLang = result.language_code;
            } catch (e) {
                console.error("STT Error:", e);
                finalText = "Error processing audio file.";
            }
        } else if (audioLink) {
            try {
                const audioBuffer = await fetch(audioLink).then(r => r.arrayBuffer());
                const result = await VoiceService.speechToText(Buffer.from(audioBuffer), 'audio/wav');
                finalText = result.text;
                detectedLang = result.language_code;
            } catch (e) {
                console.error("Failed to fetch/process audio link");
                finalText = "Error processing audio link.";
            }
        }

        if (!finalText) {
            return res.status(400).json({ error: 'No input provided (text or audio)' });
        }

        if (!detectedLang) {
            detectedLang = VoiceService.detectDialect(finalText);
        }

        const responseText = `Received: ${finalText}. Processing your request in ${detectedLang}.`;
        const audioResponse = await VoiceService.textToSpeech(responseText, detectedLang);

        res.json({
            status: 'success',
            original_input: finalText,
            detected_language: detectedLang,
            response_text: responseText,
            response_audio: audioResponse
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════
//  ENDPOINT: /api/twilio/handle-recording (existing)
// ═══════════════════════════════════════════════════════════

export const handleTwilioRecording = async (req: Request, res: Response) => {
    const recordingUrl = req.body.RecordingUrl;
    console.log('📞 Received Twilio Recording:', recordingUrl);
    res.sendStatus(200);
};

// ═══════════════════════════════════════════════════════════
//  Helper: Build URL for the eligibility endpoint with state
// ═══════════════════════════════════════════════════════════

function buildEligibilityUrl(state: Partial<CallState>): string {
    const params = new URLSearchParams();
    if (state.callSid) params.set('callSid', state.callSid);
    if (state.callerNumber) params.set('caller', state.callerNumber);
    if (state.category) params.set('category', state.category);
    if (state.name) params.set('name', state.name);
    if (state.age) params.set('age', state.age);
    if (state.state) params.set('state', state.state);
    if (state.occupation) params.set('occupation', state.occupation);
    if (state.landAcres) params.set('land', state.landAcres);
    if (state.housingType) params.set('housing', state.housingType);
    return `/api/twilio/voice-eligibility?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════
//  Helper: Build CitizenProfile from IVR CallState
// ═══════════════════════════════════════════════════════════

function buildProfileFromState(state: Partial<CallState>): any {
    const age = parseInt(state.age || '0') || 30;
    const occupation = state.occupation || 'Other';
    const landAcres = parseFloat(state.landAcres || '0');

    // Map categories to states (simplified)
    const stateMap: Record<string, string> = {
        'farmer': 'Bihar',
        'housing': 'Bihar',
        'labor': 'Bihar',
        'general': 'Bihar',
    };

    const profile: any = {
        citizen_id: `CALL_${state.callSid || Date.now()}`,
        full_name: state.name || 'Unknown Caller',
        age: age,
        gender: 'Male', // Default, could add a step
        category: 'General',
        location: {
            state: stateMap[state.category || 'general'],
            district: 'Unknown',
            rural_urban: 'Rural',
            block: 'Unknown',
        },
        occupation: {
            primary_occupation: occupation,
            is_farmer: occupation === 'Farmer',
            land_ownership_acres: landAcres > 0 ? landAcres : undefined,
        },
        income: {
            annual_income: 150000, // Default assumption for rural caller
            bpl_status: true,
        },
        family: {
            total_members: 5,
        },
        housing: {
            house_type: state.housingType || 'Semi-Pucca',
            own_house: true,
        },
        documents: {
            aadhaar: true,
            ration_card: true,
            bank_account: true,
        },
    };

    return profile;
}
