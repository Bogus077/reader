import express from 'express';
import { verifyInitData, issueJwt } from '../../lib/auth';
import User from '../../modules/users/model';
import requireAuth from '../../middleware/requireAuth';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const DEFAULT_TZ = 'Europe/Samara';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * POST /auth/telegram
 * Аутентификация через Telegram WebApp
 * Требует заголовок X-Telegram-Init-Data с данными initData
 */
router.post('/telegram', async (req, res) => {
  try {
    // Получаем initData из заголовка
    const initDataRaw = req.headers['x-telegram-init-data'] as string;
    
    if (!initDataRaw) {
      return res.status(400).json({ error: 'X-Telegram-Init-Data header is required' });
    }
    
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Проверяем подпись и валидность данных
    const { user: telegramUser } = verifyInitData(initDataRaw, BOT_TOKEN);
    
    // Ищем или создаем пользователя по telegram_id
    const [user, created] = await User.findOrCreate({
      where: { telegram_id: telegramUser.id.toString() },
      defaults: {
        telegram_id: telegramUser.id.toString(),
        name: `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`,
        role: 'student',
        tz: DEFAULT_TZ
      }
    });
    
    // Создаем JWT токен
    const token = issueJwt(
      { 
        id: user.id, 
        role: user.role, 
        name: user.name, 
        tz: user.tz 
      }, 
      JWT_SECRET, 
      30 // срок действия 30 дней
    );
    
    // Возвращаем токен и данные пользователя
    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        tz: user.tz
      }
    });
    
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: error.message });
  }
});

/**
 * GET /me
 * Получение данных текущего пользователя
 * Требует валидный JWT токен
 */
router.get('/me', requireAuth, (req, res) => {
  // Данные пользователя уже есть в req.user благодаря middleware requireAuth
  return res.json({
    id: req.user.id,
    role: req.user.role,
    name: req.user.name,
    tz: req.user.tz
  });
});

export default router;
