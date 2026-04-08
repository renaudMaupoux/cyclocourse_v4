import type { NextFunction, Request, Response } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';

interface HttpError extends Error {
  status?: number;
}

const errorHandler = (err: HttpError, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('❌ Erreur:', err);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: (err as Error & { errors?: unknown }).errors ?? err.message
    });
    return;
  }

  if (err instanceof SequelizeValidationError) {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: err.errors.map((e) => e.message)
    });
    return;
  }

  if (err.status) {
    res.status(err.status).json({
      success: false,
      error: err.message
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
};

export default errorHandler;
