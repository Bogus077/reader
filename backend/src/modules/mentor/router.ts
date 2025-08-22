import express from 'express';
import requireAuth from '../../middleware/requireAuth';
import requireMentor from '../../middleware/requireMentor';
import { validateRequest } from '../../middleware/validateRequest';
import User from '../users/model';
import StudentBook from '../studentBooks/model';
import Book from '../books/model';
import Assignment from '../assignments/model';
import Recap from '../recaps/model';
import { Op, Transaction } from 'sequelize';
import { DATE_FMT, nowInTz, todayStr, hasPassedDeadline, resolveVisualStatus } from '../../lib/time';
import { sequelize } from '../../lib/db';
import dayjs from 'dayjs';
import { updateBestStreakForStudent } from './service';
import { getActiveStudentBook, getTodayAssignment, buildStrips, computeCurrentStreak } from '../student/service';
import { generateAssignmentsSchema, updateAssignmentSchema, gradeAssignmentSchema, assignBookSchema, updateBookStatusSchema, createBookSchema } from './schemas';

const router = express.Router();

// Middleware для всех эндпоинтов ментора
router.use(requireAuth);
router.use(requireMentor);

/**
 * Генерация заданий для студента на указанный период
 * POST /mentor/assignments/generate
 * Генерация заданий для студента на указанный период
 */
router.post('/assignments/generate', requireAuth, requireMentor, validateRequest(generateAssignmentsSchema), async (req, res) => {
  try {
    const { student_book_id, mode, dailyTarget, deadline_time, startDate, endDate } = req.body;
    
    // Валидация входных данных
    if (!student_book_id || !mode || !dailyTarget || !deadline_time || !startDate || !endDate) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields'
      });
    }
    
    // Проверка корректности режима
    if (mode !== 'percent' && mode !== 'page') {
      return res.status(400).json({
        ok: false,
        error: 'Invalid mode. Must be "percent" or "page"'
      });
    }
    
    // Проверка корректности дат
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    if (start.isAfter(end)) {
      return res.status(400).json({
        ok: false,
        error: 'Start date cannot be after end date'
      });
    }
    
    // Проверка существования книги студента
    const studentBook = await StudentBook.findByPk(student_book_id);
    if (!studentBook) {
      return res.status(404).json({
        ok: false,
        error: 'Student book not found'
      });
    }
    
    // Генерация заданий
    let currentDate = start;
    let created = 0;
    let skippedExisting = 0;
    
    while (currentDate.isSame(end) || currentDate.isBefore(end)) {
      const dayOfWeek = currentDate.day(); // 0 - воскресенье, 6 - суббота
      
      // Пропускаем выходные (суббота и воскресенье)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Проверяем, существует ли уже задание на эту дату
        const existingAssignment = await Assignment.findOne({
          where: {
            student_book_id,
            date: currentDate.format('YYYY-MM-DD')
          }
        });
        
        if (!existingAssignment) {
          // Создаем новое задание
          const assignmentData: any = {
            student_book_id,
            date: currentDate.format('YYYY-MM-DD'),
            deadline_time,
            status: 'pending'
          };
          
          // Устанавливаем цель в зависимости от режима
          if (mode === 'percent') {
            assignmentData.target_percent = dailyTarget;
          } else {
            assignmentData.target_page = dailyTarget;
          }
          
          await Assignment.create(assignmentData);
          created++;
        } else {
          skippedExisting++;
        }
      }
      
      // Переходим к следующему дню
      currentDate = currentDate.add(1, 'day');
    }
    
    return res.json({
      ok: true,
      created,
      skippedExisting
    });
  } catch (error) {
    console.error('Error generating assignments:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /mentor/students
 * Получить список всех студентов с информацией о прогрессе
 */
router.get('/students', requireAuth, requireMentor, async (req, res) => {
  try {
    // Получаем всех пользователей с ролью student
    const students = await User.findAll({
      where: {
        role: 'student'
      }
    });

    // Формируем результат с дополнительной информацией для каждого студента
    const result = await Promise.all(students.map(async (student) => {
      // Получаем активную книгу студента
      const activeBook = await StudentBook.findOne({
        where: {
          student_id: student.id,
          status: 'active'
        },
        include: [{
          model: Book,
          attributes: ['id', 'title', 'cover_url']
        }]
      });

      // Информация о книге
      let bookInfo = null;
      let progressPercent = 0;

      if (activeBook) {
        // Получаем информацию о книге
        const book = await Book.findByPk(activeBook.book_id);
        if (book) {
          bookInfo = {
            id: book.id,
            title: book.title,
            cover_url: book.cover_url
          };
        }

        // Подсчитываем прогресс
        const totalAssignments = await Assignment.count({
          where: {
            student_book_id: activeBook.id
          }
        });

        const gradedAssignments = await Assignment.count({
          where: {
            student_book_id: activeBook.id,
            status: 'graded'
          }
        });

        progressPercent = totalAssignments ? Math.round((gradedAssignments / totalAssignments) * 100) : 0;
      }

      // Получаем временную зону студента или используем дефолтную
      const tz = student.tz || 'Europe/Samara';
      
      // Получаем сегодняшнюю дату в зоне студента
      const today = todayStr(tz);
      
      // Получаем статус задания на сегодня
      let todayStatus = null;
      if (activeBook) {
        const todayAssignment = await Assignment.findOne({
          where: {
            student_book_id: activeBook.id,
            date: today
          }
        });
        
        if (todayAssignment) {
          // Используем общую функцию для определения визуального статуса
          todayStatus = resolveVisualStatus({
            status: todayAssignment.status,
            date: todayAssignment.date,
            deadline_time: todayAssignment.deadline_time
          }, tz);
        }
      }

      // Получаем последнюю оценку студента
      let lastRating = null;
      const lastRecap = await Recap.findOne({
        include: [{
          model: Assignment,
          where: {
            status: 'graded'
          },
          include: [{
            model: StudentBook,
            where: {
              student_id: student.id
            }
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      if (lastRecap && lastRecap.mentor_rating) {
        lastRating = lastRecap.mentor_rating;
      }
      
      // Вычисляем текущую серию выполненных заданий
      const currentStreak = await computeCurrentStreak(student.id, tz);

      return {
        id: student.id,
        name: student.name,
        activeBook: bookInfo,
        progressPercent,
        todayStatus,
        lastRating,
        currentStreak
      };
    }));

    return res.json({
      ok: true,
      students: result
    });
  } catch (error) {
    console.error('Error fetching students list:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /mentor/students/:id
 * Получить детальную информацию о конкретном студенте
 */
router.get('/students/:id', requireAuth, requireMentor, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    
    if (isNaN(studentId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid student ID'
      });
    }
    
    // Получаем информацию о студенте
    const student = await User.findOne({
      where: {
        id: studentId,
        role: 'student'
      }
    });
    
    if (!student) {
      return res.status(404).json({
        ok: false,
        error: 'Student not found'
      });
    }
    
    // Получаем активную книгу студента
    const studentBook = await getActiveStudentBook(studentId);
    
    // Информация о книге
    let activeBook = null;
    if (studentBook) {
      // Получаем информацию о книге напрямую
      const book = await Book.findByPk(studentBook.book_id);
      if (book) {
        activeBook = {
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url
        };
      }
    }
    
    // Временная зона студента
    const tz = student.tz || 'Europe/Samara';
    
    // Информация о сегодняшнем задании
    let todayAssignment = null;
    if (studentBook) {
      // Используем обновленную функцию getTodayAssignment, которая учитывает дедлайн
      // и возвращает статус missed для заданий с прошедшим дедлайном
      const assignment = await getTodayAssignment(studentBook.id, tz);
      
      if (assignment) {
        todayAssignment = {
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
        };
      }
    }
    
    // Получаем полосочки
    const strips = await buildStrips(studentId, tz);
    
    // Вычисляем текущую серию выполненных заданий
    const currentStreak = await computeCurrentStreak(studentId, tz);
    
    // Получаем последние оценки
    const recentRecaps = await Recap.findAll({
      include: [{
        model: Assignment,
        as: 'assignment',
        where: {
          status: 'graded'
        },
        include: [{
          model: StudentBook,
          where: {
            student_id: studentId
          }
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    const recentRatings = recentRecaps.map(recap => {
      // Используем ассоциацию 'assignment'
      const assignment = recap.assignment;
      return {
        date: assignment ? dayjs(assignment.date).format('YYYY-MM-DD') : null,
        rating: recap.mentor_rating,
        comment: recap.mentor_comment
      };
    }).filter(rating => rating.date !== null);
    
    return res.json({
      ok: true,
      student: {
        id: student.id,
        name: student.name,
        tz: student.tz
      },
      activeBook,
      today: {
        assignment: todayAssignment
      },
      strips,
      recentRatings,
      currentStreak
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Изменение задания
 * PATCH /mentor/assignments/:id
 */
router.patch('/assignments/:id', requireAuth, requireMentor, validateRequest(updateAssignmentSchema), async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    if (isNaN(assignmentId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid assignment ID'
      });
    }
    
    // Получаем задание
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        ok: false,
        error: 'Assignment not found'
      });
    }
    
    // Проверяем статус задания
    if (assignment.status !== 'pending' && assignment.status !== 'submitted') {
      return res.status(409).json({
        ok: false,
        error: 'Cannot modify assignment with status: ' + assignment.status
      });
    }
    
    // Обновляем поля задания
    const { deadline_time, target_percent, target_page, target_chapter, target_last_paragraph } = req.body;
    
    // Обновляем только переданные поля
    if (deadline_time !== undefined) assignment.deadline_time = deadline_time;
    if (target_percent !== undefined) assignment.target_percent = target_percent;
    if (target_page !== undefined) assignment.target_page = target_page;
    if (target_chapter !== undefined) assignment.target_chapter = target_chapter;
    if (target_last_paragraph !== undefined) assignment.target_last_paragraph = target_last_paragraph;
    
    // Сохраняем изменения
    await assignment.save();
    
    return res.json({
      ok: true
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Оценка задания ментором
 * POST /mentor/assignments/:id/grade
 */
router.post('/assignments/:id/grade', requireAuth, requireMentor, validateRequest(gradeAssignmentSchema), async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    if (isNaN(assignmentId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid assignment ID'
      });
    }
    
    const { mentor_rating, mentor_comment } = req.body;
    
    // Проверяем наличие и корректность рейтинга
    if (!mentor_rating || mentor_rating < 1 || mentor_rating > 5) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid mentor rating. Must be between 1 and 5'
      });
    }
    
    // Получаем задание
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        ok: false,
        error: 'Assignment not found'
      });
    }
    
    // Обновляем статус задания на 'graded'
    assignment.status = 'graded';
    await assignment.save();
    
    // Создаем или обновляем запись в Recap
    let recap = await Recap.findOne({
      where: { assignment_id: assignmentId }
    });
    
    if (!recap) {
      recap = await Recap.create({
        assignment_id: assignmentId,
        mentor_rating,
        mentor_comment: mentor_comment || null
      });
    } else {
      recap.mentor_rating = mentor_rating;
      if (mentor_comment !== undefined) recap.mentor_comment = mentor_comment;
      await recap.save();
    }
    
    // Получаем информацию о студенте из задания
    const studentBook = await StudentBook.findByPk(assignment.student_book_id);
    if (!studentBook) {
      return res.status(404).json({
        ok: false,
        error: 'Student book not found'
      });
    }
    
    // Получаем информацию о студенте
    const student = await User.findByPk(studentBook.student_id);
    if (!student) {
      return res.status(404).json({
        ok: false,
        error: 'Student not found'
      });
    }
    
    // Обновляем лучший стрик студента на основе динамически вычисленного текущего стрика
    await updateBestStreakForStudent(studentBook.student_id, student.tz || 'Europe/Samara');
    
    return res.json({
      ok: true
    });
  } catch (error) {
    console.error('Error grading assignment:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Назначение книги студенту
 * POST /mentor/student-books/assign
 */
router.post('/student-books/assign', requireAuth, requireMentor, validateRequest(assignBookSchema), async (req, res) => {
  try {
    const { student_id, book_id, progress_mode, start_date } = req.body;
    
    // Проверка обязательных полей
    if (!student_id || !book_id || !progress_mode || !start_date) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields'
      });
    }
    
    // Проверка существования студента
    const student = await User.findOne({
      where: {
        id: student_id,
        role: 'student'
      }
    });
    
    if (!student) {
      return res.status(404).json({
        ok: false,
        error: 'Student not found'
      });
    }
    
    // Проверка существования книги
    const book = await Book.findByPk(book_id);
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }
    
    // Проверка корректности режима прогресса
    if (progress_mode !== 'percent' && progress_mode !== 'page') {
      return res.status(400).json({
        ok: false,
        error: 'Invalid progress mode. Must be "percent" or "page"'
      });
    }
    
    // Проверка формата даты
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Используем транзакцию для атомарности операций
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Находим текущую активную книгу студента
      const activeBook = await StudentBook.findOne({
        where: {
          student_id,
          status: 'active'
        },
        transaction: t
      });
      
      // Если есть активная книга, завершаем её
      if (activeBook) {
        activeBook.status = 'finished';
        activeBook.end_date = nowInTz(student.tz).toDate();
        await activeBook.save({ transaction: t });
      }
      
      // Создаем новую запись о книге студента
      const newStudentBook = await StudentBook.create({
        student_id: student_id,
        book_id: book_id,
        status: 'active' as const,
        start_date: new Date(start_date),
        end_date: null,
        progress_mode: progress_mode as 'percent' | 'page'
      }, { transaction: t });
      
      return newStudentBook;
    });
    
    return res.json({
      ok: true,
      student_book_id: result.id
    });
  } catch (error) {
    console.error('Error assigning book to student:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Изменение статуса книги студента
 * PATCH /mentor/student-books/:id/status
 */
router.patch('/student-books/:id/status', requireAuth, requireMentor, validateRequest(updateBookStatusSchema), async (req, res) => {
  try {
    const studentBookId = parseInt(req.params.id);
    if (isNaN(studentBookId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid student book ID'
      });
    }
    
    const { status, date } = req.body;
    
    // Проверка корректности статуса
    if (!status || !['paused', 'active', 'finished'].includes(status)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid status. Must be "paused", "active", or "finished"'
      });
    }
    
    // Проверка формата даты, если она указана
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Получаем книгу студента
    const studentBook = await StudentBook.findByPk(studentBookId);
    if (!studentBook) {
      return res.status(404).json({
        ok: false,
        error: 'Student book not found'
      });
    }
    
    // Получаем информацию о студенте
    const student = await User.findByPk(studentBook.student_id);
    if (!student) {
      return res.status(404).json({
        ok: false,
        error: 'Student not found'
      });
    }
    
    // Обновляем статус
    studentBook.status = status;
    
    // Если статус 'finished' и end_date не указана, устанавливаем текущую дату
    if (status === 'finished' && !studentBook.end_date) {
      studentBook.end_date = date ? dayjs(date).toDate() : nowInTz(student.tz).toDate();
    }
    
    await studentBook.save();
    
    return res.json({
      ok: true
    });
  } catch (error) {
    console.error('Error updating student book status:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Создание новой книги
 * POST /mentor/books
 */
router.post('/books', requireAuth, requireMentor, validateRequest(createBookSchema), async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      difficulty,
      description = null,
      cover_url = null,
      source_url = null,
    } = req.body;

    const userId = req.user?.id ?? null;

    const book = await Book.create({
      title,
      author,
      category,
      difficulty,
      description,
      cover_url,
      source_url,
      created_by: userId,
    });

    return res.status(201).json({ ok: true, book });
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

export default router;
