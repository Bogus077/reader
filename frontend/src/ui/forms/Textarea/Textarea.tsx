import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Textarea.module.scss';
import { Label } from '../Label';
import { Field } from '../Field';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  required?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
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
    const id = externalId || `textarea-${generatedId}`;
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
        
        <textarea
          ref={ref}
          id={id}
          className={clsx(
            styles.textarea,
            error && styles.error,
            className
          )}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedby}
          required={required}
          {...rest}
        />
      </Field>
    );
  }
);
