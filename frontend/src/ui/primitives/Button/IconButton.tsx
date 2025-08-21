import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Button.module.scss';
import { Spinner } from '../Spinner';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  'aria-label': string; // Обязательное свойство для доступности
};

export function IconButton({
  icon,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
  ...rest
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles.iconButton,
        styles[variant],
        styles[size],
        loading && styles.loading,
        className
      )}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...rest}
    >
      {!loading && icon}
      {loading && (
        <span className={styles.spinner}>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        </span>
      )}
    </button>
  );
}
