import { useEffect, useRef } from 'react';

/**
 * Хук для создания фокус-ловушки внутри элемента
 * Предотвращает "убегание" фокуса за пределы элемента при использовании клавиатуры
 */
export function useFocusTrap(isActive: boolean = true) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !ref.current) return;
    
    const rootElement = ref.current;
    
    // Находим все фокусируемые элементы внутри контейнера
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      
      const elements = rootElement.querySelectorAll<HTMLElement>(
        focusableSelectors.join(',')
      );
      
      return Array.from(elements);
    };
    
    // Устанавливаем фокус на первый элемент при открытии
    const setInitialFocus = () => {
      const focusableElements = getFocusableElements();
      
      if (focusableElements.length > 0) {
        // Если есть элемент с автофокусом, фокусируемся на нем
        const autoFocusElement = focusableElements.find(
          (el) => el.getAttribute('autoFocus') !== null
        );
        
        if (autoFocusElement) {
          autoFocusElement.focus();
        } else {
          // Иначе фокусируемся на первом элементе
          focusableElements[0].focus();
        }
      }
    };
    
    // Обработчик нажатия Tab для циклического перемещения фокуса
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Shift + Tab: переход к предыдущему элементу
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } 
      // Tab: переход к следующему элементу
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    // Сохраняем предыдущий активный элемент
    const previousActiveElement = document.activeElement as HTMLElement;
    
    // Устанавливаем начальный фокус
    setInitialFocus();
    
    // Добавляем обработчик клавиши Tab
    document.addEventListener('keydown', handleTabKey);
    
    // Очистка при размонтировании
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      
      // Возвращаем фокус на предыдущий элемент при закрытии
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isActive]);
  
  return ref;
}
