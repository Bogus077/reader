import { FC } from 'react';
import clsx from 'clsx';
import styles from './Progress.module.scss';

export type ProgressCircleTone = 'primary' | 'success' | 'danger' | 'muted';

export type ProgressCircleProps = {
  /**
   * Значение прогресса от 0 до 100
   */
  value: number;
  /**
   * Размер круга в пикселях
   * @default 64
   */
  size?: number;
  /**
   * Толщина линии круга в пикселях
   * @default 8
   */
  strokeWidth?: number;
  /**
   * Тон (цветовая схема) круга прогресса
   * @default 'primary'
   */
  tone?: ProgressCircleTone;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const ProgressCircle: FC<ProgressCircleProps> = ({
  value,
  size = 64,
  strokeWidth = 8,
  tone = 'primary',
  className,
}) => {
  // Нормализуем значение в диапазоне от 0 до 100
  const normalizedValue = Math.max(0, Math.min(100, value));
  
  // Рассчитываем параметры для SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  return (
    <div 
      className={clsx(styles.progressCircleContainer, styles[tone], className)}
      style={{ width: size, height: size }}
    >
      <svg
        className={styles.progressCircle}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Фоновый круг */}
        <circle
          className={styles.progressCircleBackground}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Круг прогресса */}
        <circle
          className={styles.progressCircleFill}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Процент в центре */}
      <div className={styles.progressCircleValue}>
        {Math.round(normalizedValue)}%
      </div>
    </div>
  );
};
