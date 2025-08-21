import { ChangeEvent, HTMLAttributes, ReactNode, useId } from 'react';
import clsx from 'clsx';
import styles from './RadioGroup.module.scss';
import { Label } from '../Label';

export type RadioOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = HTMLAttributes<HTMLFieldSetElement> & {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
};

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  className,
  ...rest
}: RadioGroupProps) {
  const generatedId = useId();
  const groupId = `radio-group-${generatedId}`;
  
  return (
    <fieldset
      className={clsx(styles.radioGroup, className)}
      aria-required={required}
      disabled={disabled}
      {...rest}
    >
      {label && (
        <legend>
          <Label required={required}>{label}</Label>
        </legend>
      )}
      
      {options.map((option) => {
        const optionId = `${name}-${option.value}-${generatedId}`;
        const isDisabled = disabled || option.disabled;
        
        return (
          <label
            key={option.value}
            className={styles.radioContainer}
            htmlFor={optionId}
          >
            <input
              type="radio"
              id={optionId}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={isDisabled}
              className={styles.radio}
              aria-describedby={groupId}
            />
            <span className={styles.radioCustom} />
            <span className={styles.label}>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
