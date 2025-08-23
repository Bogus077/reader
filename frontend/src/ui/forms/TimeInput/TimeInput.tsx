import { ChangeEvent, forwardRef, useId, useState } from "react";
import clsx from "clsx";
import styles from "./TimeInput.module.scss";
import { Field } from "../Field";
import { Label } from "../Label";

export type TimeInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      hint,
      required = false,
      disabled = false,
      className,
      id: externalId,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId || `time-input-${generatedId}`;
    const helperId = error || hint ? `${id}-helper` : undefined;

    // Обработка ввода времени с маской
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value.replace(/[^\d:]/g, "");

      // Применяем маску HH:mm
      if (inputValue.length > 0) {
        // Удаляем все двоеточия
        inputValue = inputValue.replace(/:/g, "");

        // Ограничиваем до 4 цифр
        if (inputValue.length > 4) {
          inputValue = inputValue.slice(0, 4);
        }

        // Форматируем как HH:mm
        if (inputValue.length > 2) {
          inputValue = `${inputValue.slice(0, 2)}:${inputValue.slice(2)}`;
        }

        // Валидация часов (0-23)
        if (inputValue.length >= 2) {
          const hours = parseInt(inputValue.slice(0, 2), 10);
          if (hours > 23) {
            inputValue = `23${inputValue.slice(2)}`;
          }
        }

        // Валидация минут (0-59)
        if (inputValue.length >= 5) {
          const minutes = parseInt(inputValue.slice(3, 5), 10);
          if (minutes > 59) {
            inputValue = `${inputValue.slice(0, 3)}59`;
          }
        }
      }

      onChange(inputValue);
    };

    return (
      <Field error={error} hint={hint} id={id}>
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}

        <input
          ref={ref}
          type="text"
          id={id}
          value={value}
          onChange={handleChange}
          className={clsx(styles.timeInput, error && styles.error, className)}
          placeholder="14:00"
          maxLength={5}
          pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
          inputMode="numeric"
          aria-invalid={!!error}
          aria-describedby={helperId}
          disabled={disabled}
          required={required}
          {...rest}
        />
      </Field>
    );
  }
);
