import express from 'express';
import requireAuth from '../../middleware/requireAuth';
import requireStudent from '../../middleware/requireStudent';
import { getActiveStudentBook, countAssignments, getTodayAssignment, listAssignmentsForActive, buildStrips, computeCurrentStreak } from './service';
import Streak from '../streaks/model';
import Recap from '../recaps/model';
import Assignment from '../assignments/model';
import Book from '../books/model';
import { Op } from 'sequelize';
import StudentBook from '../studentBooks/model';
import User from '../users/model';
import { notifyMentors } from '../../lib/telegram';
import { getStudentBonusBalance, getStudentBonusHistory } from '../bonuses/service';
import Goal from '../goals/model';

// Используем require для dayjs и его плагинов, так как нет типов
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Настройка dayjs для работы с временными зонами
dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();

// Применяем middleware для всех маршрутов
router.use(requireAuth);
router.use(requireStudent);

/**
 * GET /student/current-book
 * Получить текущую активную книгу студента и прогресс
 */
router.get('/current-book', async (req, res) => {
  try {
    const studentId = req.user.id;
    const tz = req.user.tz || 'Europe/Samara';
    
    // Получаем активную книгу студента
    const studentBook = await getActiveStudentBook(studentId);
    
    if (!studentBook) {
      return res.json({
        ok: true,
        book: null,
        progress: null,
        currentStreak: 0,
        bestStreak: 0
      });
    }
    
    // Подсчитываем прогресс
    const { total, graded } = await countAssignments(studentBook.id);
    const percent = total ? Math.round((graded / total) * 100) : 0;
    
    // Получаем информацию о книге через ассоциации
    const bookData = await Book.findByPk(studentBook.book_id);
    
    if (!bookData) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }
    
    // Вычисляем текущую серию выполненных заданий
    const currentStreak = await computeCurrentStreak(studentId, tz);
    
    // Получаем лучшую серию из таблицы streaks
    let bestStreak = 0;
    const streakRecord = await Streak.findOne({
      where: { student_id: studentId }
    });
    
    if (streakRecord) {
      bestStreak = streakRecord.best_len;
    }
    
    return res.json({
      ok: true,
      book: {
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        cover_url: bookData.cover_url
      },
      progress: {
        percent,
        daysDone: graded,
        daysTotal: total
      },
      currentStreak,
      bestStreak
    });
  } catch (error) {
    console.error('Error fetching current book:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /student/finished-books
 * Вернуть список ID книг, которые студент завершил
 */
router.get('/finished-books', async (req, res) => {
  try {
    const studentId = req.user.id;

    const rows = await StudentBook.findAll({
      where: { student_id: studentId, status: 'finished' },
      attributes: ['book_id']
    });

    const bookIds = rows.map((r: any) => r.book_id);

    return res.json({ ok: true, bookIds });
  } catch (error) {
    console.error('Error fetching finished books:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

/**
 * GET /student/assignment/by-date?date=YYYY-MM-DD
 * Получить полные данные задания по дате (включая recap)
 */
router.get('/assignment/by-date', async (req, res) => {
  try {
    const studentId = req.user.id;
    const date = String(req.query.date || '').slice(0, 10);

    if (!date) {
      return res.status(400).json({ ok: false, error: 'date query param is required (YYYY-MM-DD)' });
    }

    const studentBook = await getActiveStudentBook(studentId);
    if (!studentBook) {
      return res.json({ ok: true, assignment: null });
    }

    const assignment = await Assignment.findOne({
      where: { student_book_id: studentBook.id, date },
      include: [{ model: Recap, as: 'recap', required: false }]
    });

    if (!assignment) {
      return res.json({ ok: true, assignment: null });
    }

    return res.json({
      ok: true,
      assignment: {
        id: assignment.id,
        date: assignment.date,
        deadline_time: assignment.deadline_time,
        status: (assignment as any).status,
        target: {
          percent: (assignment as any).target_percent,
          page: (assignment as any).target_page,
          chapter: (assignment as any).target_chapter,
          last_paragraph: (assignment as any).target_last_paragraph
        },
        submitted_at: (assignment as any).submitted_at ?? null,
        mentor_rating: (assignment as any).recap?.mentor_rating ?? null,
        mentor_comment: (assignment as any).recap?.mentor_comment ?? null
      }
    });
  } catch (error) {
    console.error('Error fetching assignment by date:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

/**
 * GET /student/assignment/today
 * Получить задание на сегодня или ближайшее будущее
 */
router.get('/assignment/today', async (req, res) => {
  try {
    const studentId = req.user.id;
    const tz = req.user.tz || 'Europe/Samara';
    
    // Получаем активную книгу студента
    const studentBook = await getActiveStudentBook(studentId);
    
    if (!studentBook) {
      return res.json({
        ok: true,
        assignment: null
      });
    }
    
    // Получаем задание на сегодня или ближайшее будущее
    const assignment = await getTodayAssignment(studentBook.id, tz);
    
    if (!assignment) {
      return res.json({
        ok: true,
        assignment: null
      });
    }
    
    // Форматируем ответ, включая recap (оценка и комментарий)
    return res.json({
      ok: true,
      assignment: {
        id: assignment.id,
        date: assignment.date,
        deadline_time: assignment.deadline_time,
        status: (assignment as any).status,
        target: {
          percent: (assignment as any).target_percent,
          page: (assignment as any).target_page,
          chapter: (assignment as any).target_chapter,
          last_paragraph: (assignment as any).target_last_paragraph
        },
        submitted_at: (assignment as any).submitted_at ?? null,
        mentor_rating: (assignment as any).recap?.mentor_rating ?? null,
        mentor_comment: (assignment as any).recap?.mentor_comment ?? null
      }
    });
  } catch (error) {
    console.error('Error fetching today assignment:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /student/assignment/:id/submit
 * Отметить задание как выполненное
 */
router.post('/assignment/:id/submit', async (req, res) => {
  try {
    const studentId = req.user.id;
    const assignmentId = parseInt(req.params.id);
    
    if (isNaN(assignmentId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid assignment ID'
      });
    }
    
    // Получаем активную книгу студента
    const studentBook = await getActiveStudentBook(studentId);
    
    if (!studentBook) {
      return res.status(404).json({
        ok: false,
        error: 'No active book found'
      });
    }
    
    // Находим задание и проверяем, что оно принадлежит активной книге студента
    const assignment = await Assignment.findOne({
      where: {
        id: assignmentId,
        student_book_id: studentBook.id
      }
    });
    
    if (!assignment) {
      return res.status(404).json({
        ok: false,
        error: 'Assignment not found'
      });
    }
    
    // Проверяем, что статус задания - pending
    if (assignment.status !== 'pending') {
      return res.status(409).json({
        ok: false,
        error: 'Assignment is not in pending status'
      });
    }
    
    // Обновляем статус задания
    await assignment.update({
      status: 'submitted',
      submitted_at: new Date()
    });
    
    // Отправляем уведомление в Telegram (не блокируем основной ответ)
    try {
      const tz = req.user.tz || 'Europe/Samara';
      let studentName = `ID ${studentId}`;
      try {
        const student = await User.findByPk(studentId);
        if (student?.name) studentName = student.name;
      } catch {}
      let bookTitle = '';
      try {
        const book = await Book.findByPk(studentBook.book_id);
        if (book?.title) bookTitle = book.title;
      } catch {}
      const submittedTime = dayjs().tz(tz).format('DD.MM.YYYY HH:mm');
      const msg = [
        `✅ Студент ${studentName} отметил задание за ${assignment.date} как выполненное`,
        bookTitle ? `Книга: ${bookTitle}` : null,
        `Время: ${submittedTime} (${tz})`
      ].filter(Boolean).join('\n');
      await notifyMentors(msg);
    } catch (e) {
      console.error('Telegram notify (student submit) error:', e);
    }
    
    return res.json({
      ok: true
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /student/strips
 * Получить массив дневных сегментов по активной книге
 */
router.get('/strips', async (req, res) => {
  try {
    const studentId = req.user.id;
    const tz = req.user.tz || 'Europe/Samara';
    
    // Используем функцию buildStrips для получения массива полосочек
    const strips = await buildStrips(studentId, tz);
    
    return res.json({
      ok: true,
      strips
    });
  } catch (error) {
    console.error('Error fetching strips:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /student/progress
 * Получить прогресс студента, включая текущую и лучшую серию выполненных заданий
 */
router.get('/progress', async (req, res) => {
  try {
    const studentId = req.user.id;
    const tz = req.user.tz || 'Europe/Samara';
    
    // Вычисляем текущую серию выполненных заданий
    const currentStreak = await computeCurrentStreak(studentId, tz);
    
    // Получаем лучшую серию из таблицы streaks
    let bestStreak = 0;
    const streakRecord = await Streak.findOne({
      where: { student_id: studentId }
    });
    
    if (streakRecord) {
      bestStreak = streakRecord.best_len;
    }
    
    // Получаем активную книгу студента
    const studentBook = await getActiveStudentBook(studentId);
    
    // Если нет активной книги, возвращаем нулевые значения
    if (!studentBook) {
      return res.json({
        ok: true,
        currentStreak,
        bestStreak,
        avgRating: 0,
        daysDone: 0,
        daysTotal: 0,
        bookTitle: null
      });
    }
    
    // Достаем название книги
    let bookTitle: string | null = null;
    try {
      const book = await Book.findByPk(studentBook.book_id);
      bookTitle = book ? book.title : null;
    } catch (e) {
      bookTitle = null;
    }

    // Подсчитываем прогресс
    const { total, graded } = await countAssignments(studentBook.id);
    
    // Вычисляем среднюю оценку
    let avgRating = 0;
    const recaps = await Recap.findAll({
      include: [{
        model: Assignment,
        as: 'assignment', // Добавляем алиас, соответствующий модели
        where: {
          student_book_id: studentBook.id,
          status: 'graded'
        },
        required: true
      }]
    });
    
    if (recaps.length > 0) {
      const validRatings = recaps
        .map(recap => recap.mentor_rating)
        .filter(rating => rating !== null) as number[];
      
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
        avgRating = Math.round((sum / validRatings.length) * 10) / 10; // Округляем до 1 знака после запятой
      }
    }
    
    return res.json({
      ok: true,
      currentStreak,
      bestStreak,
      avgRating,
      daysDone: graded,
      daysTotal: total,
      bookTitle
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /student/bonus?limit=50
 * Получить баланс и историю бонусных транзакций студента
 */
router.get('/bonus', async (req, res) => {
  try {
    const studentId = req.user.id;
    const { limit: limitRaw } = req.query as { limit?: string };
    let limit = limitRaw ? parseInt(String(limitRaw)) : 50;
    if (isNaN(limit) || limit <= 0 || limit > 200) limit = 50;

    const [balance, history] = await Promise.all([
      getStudentBonusBalance(studentId),
      getStudentBonusHistory(studentId, limit),
    ]);

    const items = history.map((h: any) => ({
      id: h.id,
      assignment_id: h.assignment_id,
      delta: h.delta,
      source: h.source,
      reason: h.reason,
      createdAt: h.createdAt,
    }));

    return res.json({ ok: true, balance, history: items });
  } catch (error) {
    console.error('Error fetching student bonus:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

/**
 * GET /student/goal/active
 * Вернуть последнюю активную (pending) цель студента
 */
router.get('/goal/active', async (req, res) => {
  try {
    const studentId = req.user.id;
    const goal = await Goal.findOne({
      where: { student_id: studentId, status: 'pending' },
      order: [['createdAt', 'DESC']],
    });
    if (!goal) {
      return res.json({ ok: true, goal: null });
    }
    const item = {
      id: goal.id,
      student_id: goal.student_id,
      title: goal.title,
      reward_text: goal.reward_text,
      status: goal.status,
      required_bonuses: goal.required_bonuses,
      achieved_at: goal.achieved_at,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
    return res.json({ ok: true, goal: item });
  } catch (error) {
    console.error('Error fetching active goal:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

/**
 * GET /student/goals?status=pending|achieved|cancelled
 * Вернуть список целей студента с необязательным фильтром по статусу
 */
router.get('/goals', async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status } = req.query as { status?: string };
    const where: any = { student_id: studentId };
    if (status && ['pending', 'achieved', 'cancelled'].includes(status)) {
      where.status = status;
    }
    const goals = await Goal.findAll({ where, order: [['createdAt', 'DESC']] });
    const items = goals.map(g => ({
      id: g.id,
      student_id: g.student_id,
      title: g.title,
      reward_text: g.reward_text,
      status: g.status,
      required_bonuses: g.required_bonuses,
      achieved_at: g.achieved_at,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));
    return res.json({ ok: true, goals: items });
  } catch (error) {
    console.error('Error listing student goals:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

export default router;
