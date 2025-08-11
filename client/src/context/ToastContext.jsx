import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import Toast, { ToastContainer } from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((toastData) => {
    const id = `toast-${++toastIdRef.current}`;
    const newToast = { 
      id, 
      duration: 5000,
      ...toastData 
    };

    setToasts(prev => {
      const updatedToasts = [...prev, newToast];
      // Limit the number of toasts
      return updatedToasts.slice(-maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((title, message, options = {}) => {
    return addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title, message, options = {}) => {
    return addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title, message, options = {}) => {
    return addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title, message, options = {}) => {
    return addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  // Promise-based toast for async operations
  const promise = useCallback((promise, {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Something went wrong'
  } = {}) => {
    const loadingId = addToast({
      type: 'info',
      title: loading,
      duration: 0, // Don't auto-dismiss loading toasts
      loading: true
    });

    return promise
      .then((result) => {
        updateToast(loadingId, {
          type: 'success',
          title: success,
          duration: 3000,
          loading: false
        });
        return result;
      })
      .catch((err) => {
        updateToast(loadingId, {
          type: 'error',
          title: error,
          message: err.message,
          duration: 5000,
          loading: false
        });
        throw err;
      });
  }, [addToast, updateToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    promise
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// Hook for components that need direct access to toast state
export const useToastState = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastState must be used within a ToastProvider');
  }
  
  return {
    toasts: context.toasts,
    removeToast: context.removeToast,
    clearToasts: context.clearToasts
  };
};

export default ToastContext; 