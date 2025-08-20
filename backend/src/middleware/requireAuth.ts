import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/auth';
import dotenv from 'dotenv';

dotenv.config();

// Расширение типа Request для добавления поля user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware для проверки JWT токена
 * Проверяет заголовок Authorization: Bearer <token>
 * При успешной проверке добавляет данные пользователя в req.user
 */
export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Получаем заголовок Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }
  
  // Проверяем формат Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Authorization header format must be Bearer <token>' });
  }
  
  const token = parts[1];
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  try {
    // Проверяем токен
    const decoded = verifyJwt(token, jwtSecret);
    
    // Добавляем данные пользователя в запрос
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
