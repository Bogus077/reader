import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Paper.module.scss';

export type PaperProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
};

export function Paper({
  children,
  padding = 'md',
  className,
  ...rest
}: PaperProps) {
  return (
    <div
      className={clsx(
        styles.paper,
        styles[`padding${padding.charAt(0).toUpperCase()}${padding.slice(1)}`],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
