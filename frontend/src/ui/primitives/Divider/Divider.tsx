import { HTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Divider.module.scss';

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: 'horizontal' | 'vertical';
};

export function Divider({
  orientation = 'horizontal',
  className,
  ...rest
}: DividerProps) {
  return (
    <hr
      className={clsx(
        styles.divider,
        styles[orientation],
        className
      )}
      role="separator"
      aria-orientation={orientation}
      {...rest}
    />
  );
}
