
import express, { Router } from 'express';
import multer from 'multer';

import { checkEligibility, checkBatchEligibility } from '../controllers/eligibilityController';
import { getAllSchemes, getSchemeById } from '../controllers/schemeController';
import { createCitizenProfile, getCitizenByPhone, getCitizenById, searchCitizens } from '../controllers/citizenController';
import {
    handleVoiceInput,
    handleVoiceIncoming,
    handleVoiceGather,
    handleVoiceEligibility,
    handleVoiceCSC,
    handleTTSStream,
    handleTwilioRecording
} from '../controllers/voiceController';

const router = Router();

// Schemes
router.get('/schemes', getAllSchemes as unknown as express.RequestHandler);
router.get('/schemes/:id', getSchemeById as unknown as express.RequestHandler);

// Citizen
router.get('/citizen/search', searchCitizens as unknown as express.RequestHandler);
router.get('/citizen/:id', getCitizenById as unknown as express.RequestHandler);
router.post('/citizen/profile', createCitizenProfile as unknown as express.RequestHandler);

// Eligibility
router.post('/check-eligibility', checkBatchEligibility as unknown as express.RequestHandler);
router.post('/check-eligibility/specific', checkEligibility as unknown as express.RequestHandler);

// Voice / AI (Web API)
const upload = multer({ storage: multer.memoryStorage() });
router.post('/voice-input', upload.single('file'), handleVoiceInput as unknown as express.RequestHandler);

// Twilio IVR Endpoints
router.post('/twilio/voice-incoming', handleVoiceIncoming as unknown as express.RequestHandler);
router.post('/twilio/voice-gather', handleVoiceGather as unknown as express.RequestHandler);
router.post('/twilio/voice-eligibility', handleVoiceEligibility as unknown as express.RequestHandler);
router.post('/twilio/voice-csc', handleVoiceCSC as unknown as express.RequestHandler);
router.post('/twilio/handle-recording', handleTwilioRecording as unknown as express.RequestHandler);

// TTS Streaming (for Twilio <Play>)
router.get('/voice/tts-stream', handleTTSStream as unknown as express.RequestHandler);

export default router;
