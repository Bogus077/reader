import { HTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Spinner.module.scss';

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg';
};

export function Spinner({ size = 'md', className, ...rest }: SpinnerProps) {
  return (
    <div
      className={clsx(styles.spinner, styles[size], className)}
      role="status"
      aria-label="Загрузка"
      {...rest}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
