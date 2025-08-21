import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tzPlugin from 'dayjs/plugin/timezone';
dayjs.extend(utc); dayjs.extend(tzPlugin);
import { Assignment } from '../api/types';

/**
 * Определяет визуальный статус задания на основе его текущего статуса и дедлайна
 * @param a Задание
 * @param tz Часовой пояс
 * @returns Визуальный статус: 'pending'|'submitted'|'missed'|'graded'
 */
export function resolveVisualStatus(a: Assignment, tz: string): 'pending'|'submitted'|'missed'|'graded' {
  if (a.status === 'graded') return 'graded';
  const deadline = dayjs.tz(`${a.date} ${a.deadline_time}`, tz);
  if (dayjs().tz(tz).isAfter(deadline)) return 'missed';
  return a.status; // pending|submitted до дедлайна
}

/**
 * Преобразует статус задания в статус для DayStrips
 * @param status Статус задания: 'pending'|'submitted'|'missed'|'graded'
 * @returns Статус для DayStrips: 'current'|'done'|'missed'|'future'
 */
export function mapAssignmentToDayStripStatus(status: 'pending'|'submitted'|'missed'|'graded'): 'current'|'done'|'missed'|'future' {
  switch (status) {
    case 'graded': return 'done';
    case 'submitted': return 'current';
    case 'missed': return 'missed';
    case 'pending': return 'future';
    default: return 'future';
  }
}

/**
 * Возвращает цвет для статуса задания
 * @param status Статус задания
 * @returns CSS-класс или цвет
 */
export function mapStatusToColor(status: 'pending'|'submitted'|'missed'|'graded'|'current'|'done'|'future'): string {
  switch (status) {
    case 'graded':
    case 'done':
      return 'green'; // Зеленый для выполненных и оцененных
    case 'submitted':
    case 'current':
      return 'blue'; // Синий для текущих и отправленных
    case 'missed':
      return 'red'; // Красный для пропущенных
    case 'pending':
    case 'future':
    default:
      return 'grey'; // Серый для будущих и ожидающих
  }
}
