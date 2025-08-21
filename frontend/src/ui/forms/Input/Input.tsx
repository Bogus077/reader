import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Input.module.scss';
import { Label } from '../Label';
import { Field } from '../Field';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fullWidth?: boolean;
  required?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefix,
      suffix,
      fullWidth = false,
      required = false,
      className,
      id: externalId,
      'aria-describedby': externalAriaDescribedby,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId || `input-${generatedId}`;
    const helperId = error || hint ? `${id}-helper` : undefined;
    const ariaDescribedby = helperId
      ? externalAriaDescribedby
        ? `${externalAriaDescribedby} ${helperId}`
        : helperId
      : externalAriaDescribedby;

    return (
      <Field
        error={error}
        hint={hint}
        fullWidth={fullWidth}
        id={id}
      >
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}
        
        <div className={styles.inputWrapper}>
          {prefix && <span className={styles.prefix}>{prefix}</span>}
          
          <input
            ref={ref}
            id={id}
            className={clsx(
              styles.input,
              prefix && styles.hasPrefix,
              suffix && styles.hasSuffix,
              error && styles.error,
              className
            )}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedby}
            required={required}
            {...rest}
          />
          
          {suffix && <span className={styles.suffix}>{suffix}</span>}
        </div>
      </Field>
    );
  }
);
