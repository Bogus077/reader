import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Badge.module.scss';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  soft?: boolean;
};

export function Badge({
  children,
  tone = 'default',
  soft = false,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[tone],
        soft && styles.soft,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
