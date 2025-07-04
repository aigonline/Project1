import { useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    type?: ToastType;
    duration?: number;
}

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
}

let toastId = 0;

type ShowToast = (message: string, options?: ToastOptions) => void;

export function useToast() {
    // Replace this with your state management (e.g., context, zustand, recoil, etc.)
    // For demonstration, we'll use a simple event system.
    const showToast: ShowToast = useCallback((message, options) => {
        const event = new CustomEvent('app-toast', {
            detail: {
                id: ++toastId,
                message,
                type: options?.type || 'info',
                duration: options?.duration || 3000,
            } as Toast,
        });
        window.dispatchEvent(event);
    }, []);

    return { showToast };
}

// Example usage in your ToastProvider or component:
// useEffect(() => {
//   const handler = (e: CustomEvent<Toast>) => { /* show toast */ };
//   window.addEventListener('app-toast', handler as EventListener);
//   return () => window.removeEventListener('app-toast', handler as EventListener);
// }, []);