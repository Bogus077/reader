import { FC, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Badge.module.scss';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export type BadgeProps = {
  /**
   * Содержимое бейджа
   */
  children: ReactNode;
  /**
   * Тон (цвет) бейджа
   * @default 'primary'
   */
  tone?: BadgeTone;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const Badge: FC<BadgeProps> = ({
  children,
  tone = 'primary',
  className,
}) => {
  return (
    <span 
      className={clsx(
        styles.badge,
        styles[tone],
        className
      )}
    >
      {children}
    </span>
  );
};
