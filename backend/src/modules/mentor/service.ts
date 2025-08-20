import Streak from '../streaks/model';
import User from '../users/model';
import Assignment from '../assignments/model';
import dayjs from 'dayjs';
import { DATE_FMT } from '../../lib/time';
import { computeCurrentStreak } from '../student/service';

/**
 * Проверяет, является ли дата рабочим днем (не выходным)
 * @param date Дата в формате YYYY-MM-DD
 * @returns true, если дата - рабочий день (пн-пт), false - если выходной (сб-вс)
 */
export function isWeekday(date: string): boolean {
  const day = dayjs(date).day(); // 0 - воскресенье, 6 - суббота
  return day !== 0 && day !== 6; // Рабочие дни: 1-5 (пн-пт)
}

/**
 * Находит следующий рабочий день после указанной даты
 * @param date Дата в формате YYYY-MM-DD
 * @returns Следующий рабочий день в формате YYYY-MM-DD
 */
export function nextWeekday(date: string): string {
  let nextDay = dayjs(date).add(1, 'day');
  
  // Пропускаем выходные
  while (!isWeekday(nextDay.format(DATE_FMT))) {
    nextDay = nextDay.add(1, 'day');
  }
  
  return nextDay.format(DATE_FMT);
}

/**
 * Обновляет стрик студента на указанную дату
 * @param studentId ID студента
 * @param date Дата в формате YYYY-MM-DD
 * @returns Обновленный стрик или null в случае ошибки
 */
export async function updateStreakForStudentOnDate(studentId: number, date: string): Promise<Streak | null> {
  try {
    // Проверяем существование студента
    const student = await User.findOne({
      where: {
        id: studentId,
        role: 'student'
      }
    });
    
    if (!student) {
      console.error(`Student with ID ${studentId} not found`);
      return null;
    }
    
    // Получаем или создаем запись о стрике
    let streak = await Streak.findOne({
      where: { student_id: studentId }
    });
    
    if (!streak) {
      // Если стрика нет, создаем новый
      streak = await Streak.create({
        student_id: studentId,
        current_len: 1,
        best_len: 1,
        last_update_date: dayjs(date).toDate()
      });
      return streak;
    }
    
    // Если стрик уже существует
    if (!streak.last_update_date) {
      // Если это первое обновление стрика
      streak.current_len = 1;
      streak.best_len = 1;
      streak.last_update_date = dayjs(date).toDate();
    } else {
      // Вычисляем ожидаемую предыдущую рабочую дату
      const lastUpdateDate = dayjs(streak.last_update_date).format(DATE_FMT);
      const expectedPrevDate = nextWeekday(lastUpdateDate);
      
      // Если текущая дата совпадает с ожидаемой следующей рабочей датой
      if (date === expectedPrevDate) {
        streak.current_len += 1;
      } else {
        // Если цепочка прервалась, начинаем новую
        streak.current_len = 1;
      }
      
      // Обновляем лучший результат, если текущий его превысил
      if (streak.current_len > streak.best_len) {
        streak.best_len = streak.current_len;
      }
      
      // Обновляем дату последнего обновления
      streak.last_update_date = dayjs(date).toDate();
    }
    
    // Сохраняем изменения
    await streak.save();
    return streak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
}

/**
 * Обновляет лучший стрик студента на основе текущего стрика
 * @param studentId ID студента
 * @param tz Временная зона студента
 * @returns Обновленный стрик или null в случае ошибки
 */
export async function updateBestStreakForStudent(studentId: number, tz: string): Promise<Streak | null> {
  try {
    // Проверяем существование студента
    const student = await User.findOne({
      where: {
        id: studentId,
        role: 'student'
      }
    });
    
    if (!student) {
      console.error(`Student with ID ${studentId} not found`);
      return null;
    }
    
    // Вычисляем текущий стрик динамически
    const currentStreak = await computeCurrentStreak(studentId, tz || 'Europe/Samara');
    
    // Получаем или создаем запись о стрике
    let streak = await Streak.findOne({
      where: { student_id: studentId }
    });
    
    if (!streak) {
      // Если стрика нет, создаем новый с best_len = currentStreak
      streak = await Streak.create({
        student_id: studentId,
        best_len: currentStreak,
        current_len: 0, // Текущий стрик теперь вычисляется динамически
      });
      return streak;
    }
    
    // Обновляем лучший результат, если текущий его превысил
    if (currentStreak > streak.best_len) {
      streak.best_len = currentStreak;
      await streak.save();
    }
    
    return streak;
  } catch (error) {
    console.error('Error updating best streak:', error);
    return null;
  }
}
