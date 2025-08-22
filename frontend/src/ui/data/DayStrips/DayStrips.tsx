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
  /**
   * Выбранная дата
   */
  selectedDate?: string;
};

export const DayStrips: FC<DayStripsProps> = ({
  items,
  onSelect,
  className,
  selectedDate,
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
  
  return (
    <div className={clsx(styles.container, className)}>
      {items.map((item, idx) => (
        <div
          key={`${item.date}-${idx}`}
          className={clsx(
            styles.bar,
            styles[item.status],
            onSelect && styles.selectable,
            selectedDate === item.date && styles.selected
          )}
          onClick={onSelect ? () => handleClick(idx) : undefined}
          onKeyDown={onSelect ? (e) => handleKeyDown(e, idx) : undefined}
          tabIndex={onSelect ? 0 : undefined}
          role={onSelect ? 'button' : undefined}
          aria-label={`День ${item.date}, статус: ${item.status}`}
        />
      ))}
    </div>
  );
};
