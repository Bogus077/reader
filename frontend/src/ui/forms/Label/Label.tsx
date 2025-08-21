import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Label.module.scss';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({
  children,
  required = false,
  className,
  ...rest
}: LabelProps) {
  return (
    <label className={clsx(styles.label, className)} {...rest}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
}
