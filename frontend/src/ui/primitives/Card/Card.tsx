import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Card.module.scss';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  elevation?: 0 | 1 | 2;
  padding?: 'sm' | 'md' | 'lg';
};

export function Card({
  children,
  elevation = 1,
  padding = 'md',
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        styles[`elevation${elevation}`],
        styles[`padding${padding.charAt(0).toUpperCase()}${padding.slice(1)}`],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
