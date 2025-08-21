import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import styles from './Toast.module.scss';
import { Toast } from './Toast';
import type { ToastProps } from './toastManager';

export type ToastViewportProps = {
  toasts: ToastProps[];
  onClose: (id: string) => void;
};

export const ToastViewport = ({ toasts, onClose }: ToastViewportProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Проверка, что мы на клиенте (SSR-совместимость)
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return createPortal(
    <div className={styles.viewport} role="region" aria-label="Уведомления">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={onClose}
        />
      ))}
    </div>,
    document.body
  );
};
