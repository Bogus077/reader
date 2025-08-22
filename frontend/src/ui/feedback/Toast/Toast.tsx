import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./Toast.module.scss";
import type { ToastProps, ToastType } from "./toastManager";

export const Toast = ({
  id,
  message,
  type,
  duration = 5000,
  onClose,
}: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  // Автоматическое закрытие через указанное время
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);

      // Даем время на анимацию выхода
      const exitTimer = setTimeout(() => {
        onClose(id);
      }, 300); // Время анимации выхода

      return () => clearTimeout(exitTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Иконки для разных типов уведомлений
  const renderIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className={clsx(styles.icon)}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className={clsx(styles.icon)}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className={clsx(styles.icon)}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Обработчик закрытия по кнопке
  const handleClose = () => {
    setIsExiting(true);

    // Даем время на анимацию выхода
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div
      className={clsx(styles.toast, styles[type], isExiting && styles.exiting)}
      role="alert"
      aria-live="polite"
    >
      {renderIcon()}

      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>

      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Закрыть уведомление"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};
