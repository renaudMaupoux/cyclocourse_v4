import { Router } from 'express';
import voiceController from '../controllers/voiceController';
import { validateRecognizeText } from '../middleware/validation';

const router = Router();

router.post('/recognize-text', validateRecognizeText, voiceController.recognizeText);

export default router;
