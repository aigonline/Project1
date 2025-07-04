// contexts/ToastContext.tsx
import { createContext, useState, ReactNode } from 'react';

interface ToastContextProps {
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
  };
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextProps>({} as ToastContextProps);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
  }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};