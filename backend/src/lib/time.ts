import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export const DATE_FMT = 'YYYY-MM-DD';
export const TIME_FMT = 'HH:mm';

export function nowInTz(tz: string) {
  return dayjs().tz(tz);
}

export function todayStr(tz: string) {
  return nowInTz(tz).format(DATE_FMT);
}

export function isPast(dateStr: string, tz: string) {
  const today = todayStr(tz);
  return dayjs.tz(dateStr, tz).isBefore(dayjs.tz(today, tz), 'day');
}

export function isSameDay(dateStr: string, tz: string) {
  return dayjs.tz(dateStr, tz).isSame(nowInTz(tz), 'day');
}

export function hasPassedDeadline(dateStr: string, deadlineHHmm: string, tz: string) {
  // true, если сейчас в tz > dateStr + deadlineHHmm
  const deadline = dayjs.tz(`${dateStr} ${deadlineHHmm}`, `${DATE_FMT} ${TIME_FMT}`, tz);
  return nowInTz(tz).isAfter(deadline);
}

export function isWeekday(dateStr: string, tz: string) {
  const d = dayjs.tz(dateStr, tz);
  const wd = d.day(); // 0=Sun .. 6=Sat
  return wd !== 0 && wd !== 6;
}

export function prevDay(dateStr: string, tz: string) {
  return dayjs.tz(dateStr, tz).subtract(1, 'day').format(DATE_FMT);
}

export function prevWeekday(dateStr: string, tz: string) {
  let d = dateStr;
  do { d = prevDay(d, tz); } while (!isWeekday(d, tz));
  return d;
}

/**
 * Определяет визуальный статус задания на основе его текущего статуса, даты и дедлайна
 * 
 * Правила:
 * - graded остается как есть (graded)
 * - pending/submitted для сегодняшнего дня до дедлайна остаются как есть
 * - pending/submitted для сегодняшнего дня после дедлайна становятся missed
 * - pending/submitted для прошедших дней становятся missed
 * 
 * @param assignment Задание с полями status, date и deadline_time
 * @param tz Временная зона для определения текущей даты и проверки дедлайна
 * @returns Визуальный статус задания: 'pending', 'submitted', 'graded' или 'missed'
 */
export function resolveVisualStatus(
  assignment: { status: string; date: string | Date; deadline_time: string },
  tz: string
): 'pending' | 'submitted' | 'graded' | 'missed' {
  // Если задание уже оценено, оставляем статус как есть
  if (assignment.status === 'graded') {
    return 'graded';
  }
  
  const today = todayStr(tz);
  const assignmentDate = assignment.date;
  
  // Если дата задания в прошлом, считаем его пропущенным
  if (assignmentDate < today) {
    return 'missed';
  }
  
  // Если сегодня и дедлайн прошел, считаем задание пропущенным
  if (assignmentDate === today && hasPassedDeadline(assignmentDate, assignment.deadline_time, tz)) {
    return 'missed';
  }
  
  // В остальных случаях возвращаем оригинальный статус
  return assignment.status as 'pending' | 'submitted';
}
