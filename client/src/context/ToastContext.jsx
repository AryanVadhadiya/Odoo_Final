import { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ui/Toast';

// Create toast context
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add toast
  const addToast = useCallback((message, type = TOAST_TYPES.INFO, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      action: options.action,
      createdAt: Date.now(),
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration (unless persistent)
    if (!toast.persistent) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  // Remove toast by ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Remove all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Remove toasts by type
  const clearToastsByType = useCallback((type) => {
    setToasts(prev => prev.filter(toast => toast.type !== type));
  }, []);

  // Success toast shortcut
  const showSuccess = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.SUCCESS, options);
  }, [addToast]);

  // Error toast shortcut
  const showError = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.ERROR, options);
  }, [addToast]);

  // Warning toast shortcut
  const showWarning = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.WARNING, options);
  }, [addToast]);

  // Info toast shortcut
  const showInfo = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.INFO, options);
  }, [addToast]);

  // Update toast
  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast =>
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // Get toast count
  const getToastCount = useCallback(() => {
    return toasts.length;
  }, [toasts]);

  // Get toast count by type
  const getToastCountByType = useCallback((type) => {
    return toasts.filter(toast => toast.type === type).length;
  }, [toasts]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    clearToastsByType,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    updateToast,
    getToastCount,
    getToastCountByType,
    TOAST_TYPES,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export toast context for direct usage if needed
export { ToastContext };
