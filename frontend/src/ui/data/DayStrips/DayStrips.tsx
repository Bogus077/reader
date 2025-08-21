import { FC, KeyboardEvent, useCallback } from 'react';
import clsx from 'clsx';
import styles from './DayStrips.module.scss';

export type DayStripStatus = 'done' | 'current' | 'future' | 'missed';

export type DayStripItem = {
  /**
   * Дата сегмента в формате строки
   */
  date: string;
  /**
   * Статус сегмента
   */
  status: DayStripStatus;
  /**
   * Опциональная оценка (рейтинг)
   */
  rating?: number;
};

export type DayStripsProps = {
  /**
   * Массив элементов для отображения
   */
  items: DayStripItem[];
  /**
   * Обработчик выбора элемента
   */
  onSelect?: (idx: number) => void;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const DayStrips: FC<DayStripsProps> = ({
  items,
  onSelect,
  className,
}) => {
  const handleClick = useCallback((idx: number) => {
    onSelect?.(idx);
  }, [onSelect]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(idx);
    }
  }, [onSelect]);
  
  // Форматирование даты для отображения (день месяца)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.getDate();
    } catch (e) {
      return '';
    }
  };
  
  // Отображение рейтинга в виде звездочек
  const renderRating = (rating?: number) => {
    if (rating === undefined) return null;
    
    return (
      <div className={styles.rating}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            className={clsx(
              styles.star, 
              i < rating && styles.filled
            )}
          >
            ★
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className={clsx(styles.container, className)}>
      {items.map((item, idx) => (
        <div
          key={`${item.date}-${idx}`}
          className={clsx(
            styles.strip,
            styles[item.status],
            onSelect && styles.selectable
          )}
          onClick={onSelect ? () => handleClick(idx) : undefined}
          onKeyDown={onSelect ? (e) => handleKeyDown(e, idx) : undefined}
          tabIndex={onSelect ? 0 : undefined}
          role={onSelect ? 'button' : undefined}
          aria-label={`День ${formatDate(item.date)}, статус: ${item.status}`}
        >
          <div className={styles.date}>{formatDate(item.date)}</div>
          {renderRating(item.rating)}
        </div>
      ))}
    </div>
  );
};
