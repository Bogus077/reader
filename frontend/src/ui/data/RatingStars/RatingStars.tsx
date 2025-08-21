import { FC, useState, useCallback } from 'react';
import clsx from 'clsx';
import styles from './RatingStars.module.scss';

export type RatingStarsSize = 'sm' | 'md' | 'lg';

export type RatingStarsProps = {
  /**
   * Значение рейтинга от 0 до 5
   */
  value: number;
  /**
   * Обработчик изменения значения
   */
  onChange?: (value: number) => void;
  /**
   * Режим только для чтения
   * @default false
   */
  readOnly?: boolean;
  /**
   * Размер звезд
   * @default 'md'
   */
  size?: RatingStarsSize;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const RatingStars: FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}) => {
  // Нормализуем значение в диапазоне от 0 до 5
  const normalizedValue = Math.max(0, Math.min(5, Math.floor(value)));
  
  // Состояние для отслеживания наведения
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  // Обработчики событий
  const handleMouseEnter = useCallback((starIndex: number) => {
    if (!readOnly) {
      setHoverValue(starIndex);
    }
  }, [readOnly]);
  
  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);
  
  const handleClick = useCallback((starIndex: number) => {
    if (!readOnly && onChange) {
      // Если кликнули на текущую звезду, снимаем рейтинг
      onChange(normalizedValue === starIndex ? 0 : starIndex);
    }
  }, [readOnly, onChange, normalizedValue]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent, starIndex: number) => {
    if (!readOnly && onChange) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Если нажали на текущую звезду, снимаем рейтинг
        onChange(normalizedValue === starIndex ? 0 : starIndex);
      } else if (e.key === 'ArrowRight' && starIndex < 5) {
        e.preventDefault();
        onChange(starIndex + 1);
      } else if (e.key === 'ArrowLeft' && starIndex > 1) {
        e.preventDefault();
        onChange(starIndex - 1);
      }
    }
  }, [readOnly, onChange, normalizedValue]);
  
  // Определяем, какое значение использовать для отображения (наведение или текущее)
  const displayValue = hoverValue !== null ? hoverValue : normalizedValue;
  
  // Генерируем уникальный id для группы
  const groupId = `rating-stars-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div 
      className={clsx(
        styles.container,
        styles[size],
        readOnly && styles.readOnly,
        className
      )}
      onMouseLeave={!readOnly ? handleMouseLeave : undefined}
      role={!readOnly ? 'radiogroup' : undefined}
      aria-label="Рейтинг"
    >
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <div
          key={starIndex}
          className={clsx(
            styles.star,
            starIndex <= displayValue && styles.filled,
            !readOnly && styles.interactive
          )}
          onMouseEnter={!readOnly ? () => handleMouseEnter(starIndex) : undefined}
          onClick={!readOnly ? () => handleClick(starIndex) : undefined}
          onKeyDown={!readOnly ? (e) => handleKeyDown(e, starIndex) : undefined}
          role={!readOnly ? 'radio' : undefined}
          tabIndex={!readOnly ? 0 : undefined}
          aria-checked={!readOnly ? starIndex <= normalizedValue : undefined}
          aria-posinset={!readOnly ? starIndex : undefined}
          aria-setsize={!readOnly ? 5 : undefined}
          id={!readOnly ? `${groupId}-${starIndex}` : undefined}
        >
          ★
        </div>
      ))}
    </div>
  );
};
