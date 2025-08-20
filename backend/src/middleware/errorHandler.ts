import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // Обработка ошибок валидации Zod
  if (err instanceof ZodError) {
    const errors = err.format();
    
    return res.status(400).json({
      ok: false,
      error: 'Validation error',
      errors
    });
  }
  
  // Обработка остальных ошибок
  return res.status(500).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
};
