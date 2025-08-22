/**
 * Форматирует время из формата HH:mm в более читаемый вид
 * @param time Время в формате HH:mm
 * @returns Отформатированное время (например, "20:00")
 */
export const formatTime = (time: string): string => {
  return time;
};

/**
 * Форматирует оставшееся время в человекочитаемом виде
 * @param milliseconds Оставшееся время в миллисекундах
 * @returns Строка вида "1ч 25м" или "5м"
 */
export const formatRemainingTime = (milliseconds: number): string => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}ч ${minutes % 60}м`;
  }
  
  if (minutes > 0) {
    return `${minutes}м`;
  }
  
  return `${seconds}с`;
};
