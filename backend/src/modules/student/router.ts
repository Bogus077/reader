import express from 'express';
import requireAuth from '../../middleware/requireAuth';
import requireStudent from '../../middleware/requireStudent';
import { getActiveStudentBook, countAssignments, getTodayAssignment, listAssignmentsForActive, buildStrips, computeCurrentStreak } from './service';
import Streak from '../streaks/model';
import Recap from '../recaps/model';
import Assignment from '../assignments/model';
import Book from '../books/model';
import { Op } from 'sequelize';

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
    
    // Форматируем ответ
    return res.json({
      ok: true,
      assignment: {
        id: assignment.id,
        date: assignment.date,
        deadline_time: assignment.deadline_time,
        status: assignment.status,
        target: {
          percent: assignment.target_percent,
          page: assignment.target_page,
          chapter: assignment.target_chapter,
          last_paragraph: assignment.target_last_paragraph
        }
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
        daysTotal: 0
      });
    }
    
    // Подсчитываем прогресс
    const { total, graded } = await countAssignments(studentBook.id);
    
    // Вычисляем среднюю оценку
    let avgRating = 0;
    const recaps = await Recap.findAll({
      include: [{
        model: Assignment,
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
      daysTotal: total
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

export default router;
