import { Op } from 'sequelize';
import StudentBook from '../studentBooks/model';
import Book from '../books/model';
import Assignment from '../assignments/model';
import Recap from '../recaps/model';
import dayjs from 'dayjs';
import { DATE_FMT, todayStr, isWeekday, prevWeekday, hasPassedDeadline, resolveVisualStatus } from '../../lib/time';

/**
 * Получить активную книгу студента
 * @param studentId ID студента
 * @returns Активная книга студента с информацией о книге или null
 */
export async function getActiveStudentBook(studentId: number) {
  try {
    const studentBook = await StudentBook.findOne({
      where: {
        student_id: studentId,
        status: 'active'
      },
      include: [
        {
          model: Book,
          attributes: ['id', 'title', 'author', 'cover_url']
        }
      ]
    });
    
    return studentBook;
  } catch (error) {
    console.error('Error getting active student book:', error);
    return null;
  }
}

/**
 * Подсчитать количество заданий для книги студента
 * @param studentBookId ID книги студента
 * @returns Объект с общим количеством заданий и количеством оцененных заданий
 */
export async function countAssignments(studentBookId: number) {
  try {
    // Общее количество заданий
    const total = await Assignment.count({
      where: {
        student_book_id: studentBookId
      }
    });
    
    // Количество оцененных заданий
    const graded = await Assignment.count({
      where: {
        student_book_id: studentBookId,
        status: 'graded'
      }
    });
    
    return { total, graded };
  } catch (error) {
    console.error('Error counting assignments:', error);
    return { total: 0, graded: 0 };
  }
}

/**
 * Получить задание на сегодня или ближайшее будущее
 * @param studentBookId ID книги студента
 * @param tz Временная зона студента
 * @returns Задание на сегодня или ближайшее будущее, или null
 */
export async function getTodayAssignment(studentBookId: number, tz: string) {
  try {
    // Текущая дата в указанной временной зоне
    const today = todayStr(tz);
    
    // Ищем задание на сегодня
    let assignment = await Assignment.findOne({
      where: {
        student_book_id: studentBookId,
        date: today
      }
    });
    
    // Если есть задание на сегодня, применяем визуальный статус
    if (assignment) {
      // Не меняем статус в БД, но возвращаем копию с визуальным статусом
      const assignmentCopy = { ...assignment.toJSON() };
      const assignmentData = {
        status: assignment.status,
        date: assignment.date,
        deadline_time: assignment.deadline_time
      };
      assignmentCopy.status = resolveVisualStatus(assignmentData, tz);
      return assignmentCopy;
    }
    
    // Если нет задания на сегодня, ищем ближайшее будущее задание
    if (!assignment) {
      assignment = await Assignment.findOne({
        where: {
          student_book_id: studentBookId,
          date: {
            [Op.gt]: today
          },
          status: {
            [Op.in]: ['pending', 'submitted']
          }
        },
        order: [['date', 'ASC']]
      });
    }
    
    return assignment;
  } catch (error) {
    console.error('Error getting today assignment:', error);
    return null;
  }
}

// Расширенный тип для Assignment с включенным Recap
interface AssignmentWithRecap extends Assignment {
  recap?: {
    mentor_rating?: number | null;
    mentor_comment?: string | null;
  } | null;
}

// Тип для дневного сегмента
export interface Strip {
  date: string; // YYYY-MM-DD
  status: 'done' | 'current' | 'future' | 'missed' | 'pending' | 'submitted';
  rating?: number;         // из recaps.mentor_rating, если есть graded
  submittedAt?: string;    // ISO, если был submit
}

/**
 * Получить все задания по активной книге студента
 * @param studentId ID студента
 * @returns Объект с активной книгой и массивом заданий
 */
export async function listAssignmentsForActive(studentId: number): Promise<{ sb: StudentBook | null; items: AssignmentWithRecap[] }> {
  try {
    // TODO: Сделать период для расчета стрика конфигурируемым
    const STREAK_WINDOW_DAYS = 90; // Ограничиваем выборку последними 90 днями
    
    // Получаем активную книгу студента
    const studentBook = await getActiveStudentBook(studentId);
    
    if (!studentBook) {
      return { sb: null, items: [] };
    }
    
    // Вычисляем дату начала периода для выборки
    const startDate = dayjs().subtract(STREAK_WINDOW_DAYS, 'day').format(DATE_FMT);
    
    // Получаем задания для этой книги с информацией о рейтинге за последние STREAK_WINDOW_DAYS дней
    const assignments = await Assignment.findAll({
      where: {
        student_book_id: studentBook.id,
        date: {
          [Op.gte]: startDate // Только задания начиная с указанной даты
        }
      },
      include: [{
        model: Recap,
        as: 'recap',
        required: false
      }],
      order: [['date', 'ASC']]
    }) as unknown as AssignmentWithRecap[];
    
    return { sb: studentBook, items: assignments };
  } catch (error) {
    console.error('Error listing assignments for active book:', error);
    return { sb: null, items: [] };
  }
}

/**
 * Построить массив дневных сегментов (полосочек) для студента
 * @param studentId ID студента
 * @param tz Временная зона студента
 * @returns Массив дневных сегментов или пустой массив
 */
export async function buildStrips(studentId: number, tz: string): Promise<Strip[]> {
  try {
    // Получаем все задания по активной книге
    const { sb, items: assignments } = await listAssignmentsForActive(studentId);
    
    if (!sb || assignments.length === 0) {
      return [];
    }
    
    // Текущая дата в указанной временной зоне
    const today = todayStr(tz);
    
    // Находим current assignment - ближайший pending|submitted с датой ≥ сегодня и не прошедшим дедлайном
    const currentAssignment = assignments.find((a: Assignment) => {
      if (a.status !== 'pending' && a.status !== 'submitted') return false;
      
      const assignmentDate = dayjs(a.date).format(DATE_FMT);
      if (assignmentDate < today) return false;
      
      // Если сегодня, проверяем дедлайн
      if (assignmentDate === today) {
        return !hasPassedDeadline(assignmentDate, a.deadline_time, tz);
      }
      
      return true; // Будущие задания всегда подходят
    });
    
    // Формируем массив strips
    const strips = assignments.map((assignment: Assignment) => {
      const assignmentDate = dayjs(assignment.date).format(DATE_FMT);
      const isCurrent = currentAssignment && assignment.id === currentAssignment.id;
      
      // Определяем статус сегмента
      let status: Strip['status'];
      
      // Сначала получаем визуальный статус задания
      const assignmentData = {
        status: assignment.status,
        date: assignment.date,
        deadline_time: assignment.deadline_time
      };
      const visualStatus = resolveVisualStatus(assignmentData, tz);
      
      if (visualStatus === 'graded') {
        status = 'done';
      } else if (isCurrent) {
        status = 'current';
      } else if (assignmentDate > today) {
        status = 'future';
      } else {
        // Для сегодняшнего дня или прошедших дней используем визуальный статус
        status = visualStatus;
      }
      
      // Создаем объект сегмента
      const strip: Strip = {
        date: assignmentDate,
        status
      };
      
      // Добавляем рейтинг, если есть
      if ((assignment as any).recap && (assignment as any).recap.mentor_rating) {
        strip.rating = (assignment as any).recap.mentor_rating;
      }
      
      // Добавляем время отправки, если есть
      if (assignment.submitted_at) {
        strip.submittedAt = dayjs(assignment.submitted_at).toISOString();
      }
      
      return strip;
    });
    
    return strips;
  } catch (error) {
    console.error('Error building strips:', error);
    return [];
  }
}

/**
 * Вычисляет текущую серию выполненных заданий (стрик) для студента
 * @param studentId ID студента
 * @param tz Временная зона студента
 * @returns Количество дней в текущей серии
 */
export async function computeCurrentStreak(studentId: number, tz: string): Promise<number> {
  const { sb, items } = await listAssignmentsForActive(studentId);
  if (!sb || items.length === 0) return 0;
  const today = todayStr(tz);
  // быстрый доступ по дате
  const map = new Map<string, { a: Assignment; rating?: number }>();
  for (const a of items) {
    map.set((a as any).date, { a, rating: (a as any).Recap?.mentor_rating });
  }
  // стартуем с сегодня, но учитываем дедлайн
  let streak = 0;
  let d = today;
  // если сегодня не будний, сдвигаем на предыдущий будний
  if (!isWeekday(d, tz)) d = prevWeekday(d, tz);
  let firstStep = true;
  while (true) {
    const entry = map.get(d);
    if (!entry) {
      // нет задания на этот будний день — цепочка прерывается
      // (в дальнейшем можно учесть "паузу", но сейчас — break)
      break;
    }
    const status = (entry.a as any).status as string;
    if (firstStep) {
      // первый шаг: особое правило «сегодня после дедлайна = 0»
      firstStep = false;
      const isToday = d === today;
      if (isToday) {
        if (status === 'graded') {
          streak++;
          d = prevWeekday(d, tz);
          continue;
        } else {
          // если дедлайн прошёл и не graded → обнуляем сразу
          if (hasPassedDeadline(d, (entry.a as any).deadline_time, tz)) {
            streak = 0;
            break;
          }
          // дедлайн не прошёл — сегодня ещё в процессе, просто идём к «вчера по будням»
          d = prevWeekday(d, tz);
          continue;
        }
      }
    }
    // прошлые будни: считаем только непрерывные graded
    if (status === 'graded') {
      streak++;
      d = prevWeekday(d, tz);
      continue;
    } else {
      break;
    }
  }
  return streak;
}
