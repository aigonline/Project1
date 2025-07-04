// components/common/Toast.tsx
import { useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';

export default function Toast() {
  const { toast, hideToast } = useContext(ToastContext);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.visible, hideToast]);

  if (!toast.visible) return null;

  const borderColorClass = toast.type === 'success' 
    ? 'border-green-500' 
    : toast.type === 'error' 
      ? 'border-red-500' 
      : 'border-yellow-500';

  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border-l-4 ${borderColorClass} z-50 transform ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} transition-all duration-300`}
    >
      <div className="text-gray-800 dark:text-gray-200">{toast.message}</div>
    </div>
  );
}