
import { VoiceService } from '../src/services/voiceService';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const OUTPUT_AUDIO_PATH = path.join(__dirname, 'test_audio.wav');

async function testVoice() {
    console.log('🎙️ Testing Sarvam AI Voice Services...\n');

    // 1. Text-to-Speech (TTS)
    const textToSpeak = "नमस्ते, स्कीम साथी में आपका स्वागत है। आप कैसे हैं?";
    console.log(`1️⃣ Testing TTS with text: "${textToSpeak}"`);

    try {
        const audioBase64 = await VoiceService.textToSpeech(textToSpeak, 'hi-IN');

        if (audioBase64.startsWith('https')) {
            console.log('TTS returned URL (Mock Mode?):', audioBase64);
        } else {
            console.log('✅ TTS Success! Received Audio Base64.');
            // Save to file
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            fs.writeFileSync(OUTPUT_AUDIO_PATH, audioBuffer);
            console.log(`Saved audio to: ${OUTPUT_AUDIO_PATH}`);
        }

    } catch (error) {
        console.error('❌ TTS Failed:', error);
        return;
    }

    // 2. Speech-to-Text (STT)
    if (fs.existsSync(OUTPUT_AUDIO_PATH)) {
        console.log(`\n2️⃣ Testing STT with generated audio file...`);
        try {
            const audioBuffer = fs.readFileSync(OUTPUT_AUDIO_PATH);
            const result = await VoiceService.speechToText(audioBuffer, 'audio/wav');

            console.log('✅ STT Success!');
            console.log(`Transcript: "${result.text}"`);
            console.log(`Language Code: ${result.language_code}`);

            if (result.text.includes(" scheme sathi") || result.text.includes("स्कीम साथी")) { // Sarvam might transliterate
                console.log('🎯 Transcript matches original text closely!');
            }

        } catch (error) {
            console.error('❌ STT Failed:', error);
        }
    } else {
        console.log('Skipping STT as audio file was not generated.');
    }
}

testVoice().catch(console.error);
