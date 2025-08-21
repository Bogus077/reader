import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Switch.module.scss';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  labelPosition?: 'left' | 'right';
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      labelPosition = 'right',
      className,
      id: externalId,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId || `switch-${generatedId}`;
    
    return (
      <label 
        className={clsx(styles.switchContainer, className)}
        htmlFor={id}
      >
        {labelPosition === 'left' && (
          <span className={clsx(styles.label, styles.labelLeft)}>{label}</span>
        )}
        
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={id}
          className={styles.switch}
          disabled={disabled}
          {...rest}
        />
        <span className={styles.switchTrack}>
          <span className={styles.switchThumb} />
        </span>
        
        {labelPosition === 'right' && (
          <span className={clsx(styles.label, styles.labelRight)}>{label}</span>
        )}
      </label>
    );
  }
);
