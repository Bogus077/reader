import { FC } from 'react';
import clsx from 'clsx';
import styles from './Progress.module.scss';

export type ProgressBarTone = 'primary' | 'success' | 'danger' | 'muted';

export type ProgressBarProps = {
  /**
   * Значение прогресса от 0 до 100
   */
  value: number;
  /**
   * Необязательная текстовая метка
   */
  label?: string;
  /**
   * Тон (цветовая схема) прогресс-бара
   * @default 'primary'
   */
  tone?: ProgressBarTone;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  label,
  tone = 'primary',
  className,
}) => {
  // Нормализуем значение в диапазоне от 0 до 100
  const normalizedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className={clsx(styles.progressBarContainer, className)}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={clsx(styles.progressBar, styles[tone])}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${normalizedValue}%` }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className={styles.value}>{Math.round(normalizedValue)}%</div>
    </div>
  );
};
