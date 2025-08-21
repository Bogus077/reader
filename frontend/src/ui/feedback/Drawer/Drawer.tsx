import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './Drawer.module.scss';
import { useFocusTrap, useEscapeKey } from '../../hooks';

export type DrawerProps = {
  /**
   * Содержимое шторки
   */
  children: ReactNode;
  
  /**
   * Флаг, указывающий, открыта ли шторка
   */
  isOpen: boolean;
  
  /**
   * Функция, вызываемая при закрытии шторки
   */
  onClose: () => void;
  
  /**
   * Дополнительный класс для шторки
   */
  className?: string;
};

export const Drawer = ({ children, isOpen, onClose, className }: DrawerProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
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
  
  // Эффект для анимации появления/исчезновения
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Время анимации в мс
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen]);
  
  // Эффект для блокировки прокрутки body при открытии шторки
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
  
  // Не рендерим ничего, если шторка закрыта или мы на сервере
  if (!isVisible && !isOpen || !isMounted) {
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
        className={clsx(
          styles.drawer,
          isOpen && styles.open,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.handle} aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body
  );
};
