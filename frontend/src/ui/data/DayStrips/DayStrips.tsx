import { FC, KeyboardEvent, useCallback } from 'react';
import clsx from 'clsx';
import { mapStatusToColor } from '../../../lib/visualStatus';
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
    
    const starStyle = {
      color: 'rgba(255, 255, 255, 0.3)'
    };
    
    const filledStarStyle = {
      color: '#fff'
    };
    
    return (
      <div className={styles.rating}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            style={i < rating ? filledStarStyle : starStyle}
          >
            ★
          </span>
        ))}
      </div>
    );
  };
  
  // Функция для получения стиля полоски на основе статуса
  const getStripStyle = (status: DayStripStatus) => {
    // Получаем цвет из функции mapStatusToColor
    const color = mapStatusToColor(status);
    
    // Цветовая карта для полосок
    const colorMap: Record<string, string> = {
      green: '#2ecc71',  // done
      blue: '#4a6cf7',   // current
      red: '#e74c3c',    // missed
      grey: '#95a5a6'    // future
    };
    
    return {
      backgroundColor: colorMap[color] || colorMap.grey,
      color: 'white'
    };
  };
  
  return (
    <div className={clsx(styles.container, className)}>
      {items.map((item, idx) => (
        <div
          key={`${item.date}-${idx}`}
          className={clsx(
            styles.strip,
            onSelect && styles.selectable
          )}
          style={getStripStyle(item.status)}
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
