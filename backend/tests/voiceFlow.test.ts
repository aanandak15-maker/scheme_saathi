import { VoiceService } from '../src/services/voiceService';

describe('Voice Flow Simulation Tests', () => {
    test('detectDialect should identify Hindi correctly', () => {
        const text = "नमस्ते, मुझे पीएम किसान योजना के बारे में जानना है";
        const dialect = VoiceService.detectDialect(text);
        expect(dialect).toBe('hi-IN');
    });

    test('detectDialect should identify Bhojpuri correctly', () => {
        const text = "प्रणाम, राउर कइसन बानी? हमार खेती के पैसा कब आई?";
        const dialect = VoiceService.detectDialect(text);
        expect(dialect).toBe('bho-IN');
    });

    test('detectDialect should identify English correctly', () => {
        const text = "Hello, I want to apply for a pension scheme.";
        const dialect = VoiceService.detectDialect(text);
        expect(dialect).toBe('en-IN');
    });

    test('speechToText should return mock if no API key', async () => {
        // Ensure environment is clean
        const originalKey = process.env.SARVAM_API_KEY;
        delete process.env.SARVAM_API_KEY;

        const result = await VoiceService.speechToText(Buffer.from('dummy'), 'audio/wav');
        expect(result.text).toContain('Mock transcription');

        process.env.SARVAM_API_KEY = originalKey;
    });
});
