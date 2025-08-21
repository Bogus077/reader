import { ChangeEvent, forwardRef, useEffect, useId, useState } from 'react';
import clsx from 'clsx';
import styles from './NumberInput.module.scss';
import { Field } from '../Field';
import { Label } from '../Label';

export type NumberInputProps = {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
  suffix?: string;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      value,
      onChange,
      min,
      max,
      step = 1,
      error,
      hint,
      required = false,
      disabled = false,
      className,
      id: externalId,
      placeholder,
      suffix,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId || `number-input-${generatedId}`;
    const helperId = error || hint ? `${id}-helper` : undefined;
    
    // Локальное состояние для отображения в инпуте
    const [inputValue, setInputValue] = useState<string>(value !== null ? value.toString() : '');
    
    // Обновляем локальное состояние при изменении внешнего значения
    useEffect(() => {
      setInputValue(value !== null ? value.toString() : '');
    }, [value]);
    
    // Обработка ввода числа
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Если поле пустое, передаем null
      if (newValue === '') {
        onChange(null);
        return;
      }
      
      // Преобразуем в число и проверяем валидность
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    };
    
    // Увеличение значения
    const handleIncrement = () => {
      if (disabled) return;
      
      const currentValue = value !== null ? value : 0;
      const newValue = Math.min(max !== undefined ? max : Infinity, currentValue + step);
      onChange(newValue);
    };
    
    // Уменьшение значения
    const handleDecrement = () => {
      if (disabled) return;
      
      const currentValue = value !== null ? value : 0;
      const newValue = Math.max(min !== undefined ? min : -Infinity, currentValue - step);
      onChange(newValue);
    };
    
    // Проверка достижения минимального/максимального значения
    const isMinReached = min !== undefined && (value === null || value <= min);
    const isMaxReached = max !== undefined && (value !== null && value >= max);
    
    return (
      <Field
        error={error}
        hint={hint}
        id={id}
      >
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}
        
        <div className={styles.numberInputWrapper}>
          <input
            ref={ref}
            type="number"
            id={id}
            value={inputValue}
            onChange={handleChange}
            className={clsx(
              styles.numberInput,
              error && styles.error,
              className
            )}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={helperId}
            disabled={disabled}
            required={required}
            {...rest}
          />
          
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.button}
              onClick={handleIncrement}
              disabled={disabled || isMaxReached}
              aria-label="Увеличить"
              tabIndex={-1}
            >
              ▲
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={handleDecrement}
              disabled={disabled || isMinReached}
              aria-label="Уменьшить"
              tabIndex={-1}
            >
              ▼
            </button>
          </div>
          
          {suffix && (
            <div className={styles.suffix}>{suffix}</div>
          )}
        </div>
      </Field>
    );
  }
);
