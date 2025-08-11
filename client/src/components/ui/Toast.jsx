import React, { useEffect, useState } from 'react';
import { ToastContext } from '../../context/ToastContext';

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 200);
  };

  // Auto-remove if not persistent
  useEffect(() => {
    if (toast.persistent) return;

    const timer = setTimeout(() => {
      handleRemove();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, toast.persistent]);

  // Get toast styles based on type
  const getToastStyles = () => {
    const baseStyles = 'flex items-start p-4 rounded-lg shadow-lg border-l-4 transition-all duration-200 transform';

    const typeStyles = {
      success: 'bg-green-50 border-green-400 text-green-800',
      error: 'bg-red-50 border-red-400 text-red-800',
      warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      info: 'bg-blue-50 border-blue-400 text-blue-800',
    };

    return `${baseStyles} ${typeStyles[toast.type] || typeStyles.info}`;
  };

  // Get icon based on type
  const getIcon = () => {
    const iconClasses = 'w-5 h-5 flex-shrink-0';

    switch (toast.type) {
      case 'success':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const toastClasses = [
    getToastStyles(),
    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
    isLeaving ? 'translate-x-full opacity-0' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={toastClasses} role="alert" aria-live="assertive">
      {/* Icon */}
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>

        {/* Action Button */}
        {toast.action && (
          <div className="mt-2">
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Toast Container component
export const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// Hook for showing toasts - this will be used by components that need to show toasts
export const useShowToast = () => {
  // This will be provided by the ToastProvider context
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();
  return { showSuccess, showError, showWarning, showInfo };
};

// Context hook - this should be used within the ToastProvider
const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

Toast.displayName = 'Toast';
ToastContainer.displayName = 'ToastContainer';

export default Toast;
