import express from 'express';
import requireAuth from '../../middleware/requireAuth';
import requireStudent from '../../middleware/requireStudent';
import { validateRequest } from '../../middleware/validateRequest';
import { z } from 'zod';
import Log from './model';

const router = express.Router();

// Глобальные middleware для всех эндпоинтов логов
router.use(requireAuth);
router.use(requireStudent);

// Схема валидации тела запроса для создания лога
const createLogSchema = z.object({
  body: z.object({
    action: z.enum(['progress_open', 'history_open', 'today_open', 'library_open']),
    metadata: z.unknown().optional().nullable(),
  }),
});

/**
 * POST /logs
 * Создать запись лога действия студента
 */
router.post('/', validateRequest(createLogSchema), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { action, metadata } = req.body as { action: 'progress_open' | 'history_open' | 'today_open' | 'library_open'; metadata?: any | null };

    await Log.create({
      user_id: userId,
      action,
      metadata: metadata ?? null,
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error creating log:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

export default router;
