import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware для валидации запросов с использованием Zod схем
 * @param schema Zod схема для валидации
 * @returns Express middleware
 */
export const validateRequest = (schema: z.ZodType<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // Передаем ошибку в общий обработчик ошибок
      return next(error);
    }
  };
};
