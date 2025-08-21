import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Select.module.scss';
import { Label } from '../Label';
import { Field } from '../Field';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'options'> & {
  options: SelectOption[];
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  required?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      hint,
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
    const id = externalId || `select-${generatedId}`;
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
        
        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={id}
            className={clsx(
              styles.select,
              error && styles.error,
              className
            )}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedby}
            required={required}
            {...rest}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.icon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Field>
    );
  }
);
