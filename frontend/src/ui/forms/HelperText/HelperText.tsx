import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './HelperText.module.scss';

export type HelperTextProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  error?: boolean;
};

export function HelperText({
  children,
  error = false,
  className,
  ...rest
}: HelperTextProps) {
  return (
    <p 
      className={clsx(
        styles.helperText,
        error ? styles.error : styles.default,
        className
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
