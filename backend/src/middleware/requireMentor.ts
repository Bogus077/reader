import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для проверки роли пользователя
 * Требует, чтобы пользователь был ментором
 * Должен использоваться после middleware requireAuth
 */
export default function requireMentor(req: Request, res: Response, next: NextFunction) {
  // Проверяем наличие данных пользователя (должны быть установлены в requireAuth)
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Проверяем роль пользователя
  if (req.user.role !== 'mentor') {
    return res.status(403).json({ error: 'Access denied. Mentor role required' });
  }
  
  next();
}
