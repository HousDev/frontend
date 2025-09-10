import React, { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const toastState: ToastState = {
  toasts: [],
};

const listeners: Set<() => void> = new Set();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration ?? 5000,
  };
  
  toastState.toasts.push(newToast);
  notify();
  
  // Auto remove toast after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }
  
  return id;
};

const removeToast = (id: string) => {
  const index = toastState.toasts.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toastState.toasts.splice(index, 1);
    notify();
  }
};

export const useToast = () => {
  const [, forceUpdate] = useState(0);
  
  const subscribe = useCallback(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);
  
  React.useEffect(() => {
    return subscribe();
  }, [subscribe]);
  
  return {
    toasts: toastState.toasts,
    toast: addToast,
    dismiss: removeToast,
  };
};

// Convenience methods
export const toast = {
  success: (description: string, title?: string) => addToast({
    title,
    description,
    variant: 'success',
  }),
  
  error: (description: string, title?: string) => addToast({
    title: title || 'Error',
    description,
    variant: 'destructive',
  }),
  
  warning: (description: string, title?: string) => addToast({
    title,
    description,
    variant: 'warning',
  }),
  
  info: (description: string, title?: string) => addToast({
    title,
    description,
    variant: 'default',
  }),
};

export default useToast;