import { FC, ChangeEvent } from 'react';
import styles from './DateInput.module.scss';

export type DateInputProps = {
  /**
   * Метка поля
   */
  label?: string;
  /**
   * Значение поля в формате YYYY-MM-DD
   */
  value: string;
  /**
   * Обработчик изменения значения
   */
  onChange: (value: string) => void;
  /**
   * Текст ошибки
   */
  error?: string;
  /**
   * Флаг отключения поля
   */
  disabled?: boolean;
  /**
   * Флаг обязательного поля
   */
  required?: boolean;
  /**
   * Минимальная дата
   */
  min?: string;
  /**
   * Максимальная дата
   */
  max?: string;
};

export const DateInput: FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  max,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const id = `date-input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={id}
        type="date"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        className={`${styles.input} ${error ? styles.error : ''}`}
      />
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};
