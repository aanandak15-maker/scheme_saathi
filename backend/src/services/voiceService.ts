
import fs from 'fs';
import path from 'path';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_API_URL = 'https://api.sarvam.ai';

export interface TranscriptionResult {
    text: string;
    language_code: string;
}

/**
 * Sarvam AI Voice Service
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS)
 */
export class VoiceService {

    /**
     * Transcribe Audio using Sarvam AI
     * @param audioBuffer - The audio file buffer
     * @param mimeType - Content type (e.g., 'audio/wav', 'audio/mp3')
     */
    public static async speechToText(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
        if (!SARVAM_API_KEY) {
            console.warn('⚠️ SARVAM_API_KEY missing. Returning mock transcription.');
            return { text: "Mock transcription: Sarvam API key not set.", language_code: "hi-IN" };
        }

        try {
            const formData = new FormData();
            // Create a Blob from buffer (Node.js 18+)
            const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
            formData.append('file', blob, 'audio.wav'); // Filename is often required
            formData.append('model', 'saarika:v2.5');

            const response = await this.retryOperation(async () => {
                return fetch(`${SARVAM_API_URL}/speech-to-text`, {
                    method: 'POST',
                    headers: {
                        'api-subscription-key': SARVAM_API_KEY,
                    },
                    body: formData,
                });
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Sarvam STT Error Body:', errorText);
                throw new Error(`Sarvam STT failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return {
                text: data.transcript || "",
                language_code: data.language_code || "hi-IN"
            };

        } catch (error) {
            console.error('Sarvam STT Error:', error);
            throw error;
        }
    }

    /**
     * Convert Text to Speech using Sarvam AI
     * @param text - Text to synthesize
     * @param languageCode - 'hi-IN' | 'en-IN' | 'bn-IN' etc.
     */
    public static async textToSpeech(text: string, languageCode: string = 'hi-IN'): Promise<string> {
        if (!SARVAM_API_KEY) {
            console.warn('⚠️ SARVAM_API_KEY missing. Returning mock audio URL.');
            return "https://mock.url/audio.mp3";
        }

        try {
            const response = await this.retryOperation(async () => {
                return fetch(`${SARVAM_API_URL}/text-to-speech`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-subscription-key': SARVAM_API_KEY,
                    },
                    body: JSON.stringify({
                        inputs: [text],
                        target_language_code: languageCode,
                        speaker: 'manisha',
                        model: 'bulbul:v2'
                    }),
                });
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Sarvam TTS Error Body:', errorText);
                throw new Error(`Sarvam TTS failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            // Assuming API returns base64 audio or a URL
            return data.audios[0] || "";

        } catch (error) {
            console.error('Sarvam TTS Error:', error);
            throw error;
        }
    }

    /**
     * Convert Text to Speech and return raw audio Buffer
     * Used by the TTS streaming endpoint for Twilio <Play>
     */
    public static async textToSpeechBuffer(text: string, languageCode: string = 'hi-IN'): Promise<Buffer> {
        const base64Audio = await this.textToSpeech(text, languageCode);
        return Buffer.from(base64Audio, 'base64');
    }

    /**
     * Detect Dialect/Language based on text
     * Simple heuristic for now, can be enhanced with AI
     */
    public static detectDialect(text: string): 'hi-IN' | 'en-IN' | 'bho-IN' {
        // Check for Devanagari script
        const hasDevanagari = /[\u0900-\u097F]/.test(text);

        if (hasDevanagari) {
            // Simple Bhojpuri keyword check (Devanagari equivalent)
            const bhojpuriKeywords = ['का बा', 'राउर', 'कइसन', 'बानी', 'हमार'];
            if (bhojpuriKeywords.some(kw => text.includes(kw))) {
                return 'bho-IN';
            }
            return 'hi-IN';
        }

        return 'en-IN';
    }

    /**
     * Retry Helper with Exponential Backoff
     */
    private static async retryOperation<T>(operation: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (retries <= 0) throw error;
            console.log(`Retrying operation... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, delay));
            return this.retryOperation(operation, retries - 1, delay * 2);
        }
    }
}
