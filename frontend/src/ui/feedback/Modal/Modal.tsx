import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';
import { useFocusTrap, useEscapeKey } from '../../hooks';

export type ModalProps = {
  /**
   * Содержимое модального окна
   */
  children: ReactNode;
  
  /**
   * Флаг, указывающий, открыто ли модальное окно
   */
  isOpen: boolean;
  
  /**
   * Функция, вызываемая при закрытии модального окна
   */
  onClose: () => void;
  
  /**
   * Дополнительный класс для модального окна
   */
  className?: string;
};

export const Modal = ({ children, isOpen, onClose, className }: ModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Используем хук для фокус-ловушки
  const focusTrapRef = useFocusTrap(isOpen);
  
  // Используем хук для обработки клавиши Escape
  useEscapeKey(onClose, isOpen);
  
  // Обработчик клика по backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Эффект для блокировки прокрутки body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Эффект для проверки, что мы на клиенте (SSR-совместимость)
  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  // Не рендерим ничего, если модальное окно закрыто или мы на сервере
  if (!isOpen || !isMounted) {
    return null;
  }
  
  // Создаем портал в body
  return createPortal(
    <div 
      className={styles.backdrop} 
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={focusTrapRef}
        className={`${styles.modal} ${className || ''}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
