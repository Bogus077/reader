import { createRoot } from 'react-dom/client';
import React from 'react';
import { ToastViewport } from './ToastViewport';

// Типы для тостов
export type ToastType = 'success' | 'error' | 'info';

export type ToastProps = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
};

// Тип для хранения состояния тостов
type ToastState = {
  toasts: ToastProps[];
};

// Класс для управления тостами
class ToastManager {
  private static instance: ToastManager;
  private container: HTMLDivElement | null = null;
  private root: ReturnType<typeof createRoot> | null = null;
  private state: ToastState = { toasts: [] };
  
  // Приватный конструктор для синглтона
  private constructor() {
    // Инициализация будет происходить при первом вызове метода
  }
  
  // Получение экземпляра синглтона
  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }
  
  // Инициализация контейнера и корня React
  private initialize() {
    if (typeof document === 'undefined') return;
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
      this.root = createRoot(this.container);
      this.render();
    }
  }
  
  // Рендеринг компонента ToastViewport
  private render() {
    if (!this.root) return;
    
    this.root.render(
      React.createElement(ToastViewport, {
        toasts: this.state.toasts,
        onClose: this.closeToast
      })
    );
  }
  
  // Добавление нового тоста
  private addToast(message: string, type: ToastType, duration?: number) {
    this.initialize();
    
    const id = Date.now().toString();
    const newToast: ToastProps = {
      id,
      message,
      type,
      duration,
      onClose: this.closeToast,
    };
    
    this.state = {
      toasts: [...this.state.toasts, newToast],
    };
    
    this.render();
    return id;
  }
  
  // Закрытие тоста по id
  private closeToast = (id: string) => {
    this.state = {
      toasts: this.state.toasts.filter((toast) => toast.id !== id),
    };
    
    this.render();
  };
  
  // Публичные методы для создания тостов
  public success(message: string, duration?: number) {
    return this.addToast(message, 'success', duration);
  }
  
  public error(message: string, duration?: number) {
    return this.addToast(message, 'error', duration);
  }
  
  public info(message: string, duration?: number) {
    return this.addToast(message, 'info', duration);
  }
  
  // Закрытие всех тостов
  public closeAll() {
    this.state = { toasts: [] };
    this.render();
  }
}

// Экспортируем экземпляр синглтона
export const toast = ToastManager.getInstance();
