import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  onAction,
  actionLabel,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef(null);
  const toastRef = useRef(null);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success',
      textColor: 'text-success',
      borderColor: 'border-success/20',
      iconColor: 'text-success'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-danger',
      textColor: 'text-danger',
      borderColor: 'border-danger/20',
      iconColor: 'text-danger'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning',
      textColor: 'text-warning',
      borderColor: 'border-warning/20',
      iconColor: 'text-warning'
    },
    info: {
      icon: Info,
      bgColor: 'bg-midnight',
      textColor: 'text-midnight',
      borderColor: 'border-midnight/20',
      iconColor: 'text-midnight'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
      handleClose();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        relative w-full max-w-sm bg-white border rounded-lg shadow-lg
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        ${config.borderColor}
        ${className}
      `}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <p className={`text-sm font-medium ${config.textColor}`}>
              {title}
            </p>
          )}
          {message && (
            <p className="mt-1 text-sm text-gray-600">
              {message}
            </p>
          )}
          
          {onAction && actionLabel && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleAction}
                className={`
                  text-sm font-medium ${config.textColor} hover:opacity-80
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-midnight
                `}
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            onClick={handleClose}
            className={`
              bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600
              focus:outline-none focus:ring-2 focus:ring-midnight focus:ring-offset-2
            `}
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${config.bgColor} transition-all duration-300 ease-linear`}
            style={{
              width: isExiting ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = ({
  toasts = [],
  onClose,
  onAction,
  position = 'top-right',
  className = '',
  ...props
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`
        fixed z-50 space-y-4 pointer-events-none
        ${positionClasses[position]}
        ${className}
      `}
      {...props}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={onClose}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
};

// Toast Context Hook (simplified version)
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = (toastData) => {
    const id = `toast-${++toastIdRef.current}`;
    const newToast = { id, ...toastData };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title, message, options = {}) => 
    addToast({ type: 'success', title, message, ...options });
  
  const error = (title, message, options = {}) => 
    addToast({ type: 'error', title, message, ...options });
  
  const warning = (title, message, options = {}) => 
    addToast({ type: 'warning', title, message, ...options });
  
  const info = (title, message, options = {}) => 
    addToast({ type: 'info', title, message, ...options });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

export default Toast; 