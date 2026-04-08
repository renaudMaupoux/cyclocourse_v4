import type { NextFunction, Request, Response } from 'express';
import type { Model } from 'sequelize';
import voiceRecognitionService, { type DetectedNumberForCreate } from '../services/voiceRecognition';
import NumberModel from '../models/Number';

async function persistDetectedNumbers(
  req: Request,
  detectedNumbers: DetectedNumberForCreate[]
): Promise<Model[]> {
  if (!detectedNumbers.length) {
    return [];
  }
  const savedNumbers: Model[] = [];
  const io = req.app.get('io');

  for (const numData of detectedNumbers) {
    const number = await NumberModel.create(numData as unknown as Parameters<typeof NumberModel.create>[0]);
    savedNumbers.push(number);

    if (io) {
      const row = number.get({ plain: true }) as {
        id: string;
        value: number;
        confidence: number;
        originalText: string | null;
        timestamp: Date;
      };
      io.emit('number-detected', {
        id: row.id,
        value: row.value,
        confidence: row.confidence,
        originalText: row.originalText,
        timestamp: row.timestamp
      });
    }
  }
  return savedNumbers;
}

export default {
  async recognizeText(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body as { text: string; confidence?: number };
      const confidence =
        typeof req.body.confidence === 'number' ? Math.min(1, Math.max(0, req.body.confidence)) : 0.82;

      const detectedNumbers = voiceRecognitionService.recognizeFromText(text, confidence);

      if (detectedNumbers.length === 0) {
        res.json({
          success: true,
          message: 'Aucun chiffre détecté dans le texte',
          data: []
        });
        return;
      }

      const savedNumbers = await persistDetectedNumbers(req, detectedNumbers);

      res.json({
        success: true,
        message: `${savedNumbers.length} chiffre(s) détecté(s)`,
        data: savedNumbers
      });
    } catch (error) {
      console.error('❌ Erreur dans recognizeText:', error);
      next(error);
    }
  }
};
