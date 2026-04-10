import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

const recognizeTextSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(8000)
    .required()
    .messages({
      'string.empty': 'Le texte ne peut pas être vide',
      'any.required': 'Le texte est requis'
    }),
  confidence: Joi.number().min(0).max(1).optional()
});

export const validateRecognizeText = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = recognizeTextSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: error.details[0]?.message
    });
    return;
  }
  next();
};

const numberSchema = Joi.object({
  value: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.base': 'La valeur doit être un nombre',
      'number.integer': 'La valeur doit être un entier',
      'number.min': 'La valeur doit être au minimum 1',
      'number.max': 'La valeur doit être au maximum 1000',
      'any.required': 'La valeur est requise'
    })
});

export const validateNumber = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = numberSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: error.details[0]?.message
    });
    return;
  }

  next();
};

const riderSchema = Joi.object({
  numero: Joi.number().integer().min(1).max(1000).required(),
  nom: Joi.string().min(1).max(200).required(),
  club: Joi.string().max(300).allow('').optional(),
  category: Joi.number().integer().min(1).max(6).required()
});

export const validateRider = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = riderSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: error.details[0]?.message
    });
    return;
  }
  next();
};

const importCsvSchema = Joi.object({
  csvText: Joi.string().min(1).max(2_000_000).required()
});

export const validateImportCsv = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = importCsvSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: error.details[0]?.message
    });
    return;
  }
  next();
};
