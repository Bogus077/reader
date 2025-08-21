import { InputHTMLAttributes, ReactNode, forwardRef, useEffect, useId, useRef, useImperativeHandle } from 'react';
import clsx from 'clsx';
import styles from './Checkbox.module.scss';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  indeterminate?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      indeterminate = false,
      className,
      id: externalId,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId || `checkbox-${generatedId}`;
    const internalRef = useRef<HTMLInputElement>(null);
    
    // Экспортируем методы и свойства для внешнего ref
    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);
    
    // Управление состоянием indeterminate
    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    
    return (
      <label 
        className={clsx(styles.checkboxContainer, className)}
        htmlFor={id}
      >
        <input
          ref={internalRef}
          type="checkbox"
          id={id}
          className={styles.checkbox}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : undefined}
          {...rest}
        />
        <span className={styles.checkboxCustom} />
        <span className={styles.label}>{label}</span>
      </label>
    );
  }
);
