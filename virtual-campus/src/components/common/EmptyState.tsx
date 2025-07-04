import { ReactNode } from 'react';

type EmptyStateVariant = 'default' | 'success' | 'info' | 'warning';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string; // FontAwesome icon class
  variant?: EmptyStateVariant;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  message,
  icon = 'check',
  variant = 'default',
  action
}: EmptyStateProps) {
  const getIconClass = (): string => {
    switch (variant) {
      case 'success':
        return 'text-green-500';
      case 'info':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getIconBgClass = (): string => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="text-center py-6">
      <div className={`w-12 h-12 ${getIconBgClass()} rounded-full flex items-center justify-center mx-auto mb-3`}>
        <i className={`fas fa-${icon} ${getIconClass()} text-xl`}></i>
      </div>
      <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {message && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}