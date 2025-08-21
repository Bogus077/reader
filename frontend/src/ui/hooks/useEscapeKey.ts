import { useEffect, useCallback } from 'react';

/**
 * Хук для обработки нажатия клавиши Escape
 * @param onEscape Функция, которая будет вызвана при нажатии Escape
 * @param isEnabled Флаг, указывающий, активен ли обработчик
 */
export function useEscapeKey(onEscape: () => void, isEnabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    },
    [onEscape]
  );

  useEffect(() => {
    if (!isEnabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isEnabled]);
}
