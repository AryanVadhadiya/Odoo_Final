import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore body scroll
      document.body.style.overflow = 'unset';

      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // If modal is not open, don't render
  if (!isOpen) return null;

  // Create portal to render modal at the end of body
  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal */}
        <div
          ref={modalRef}
          className={`
            relative bg-white rounded-lg shadow-xl w-full
            ${sizeClasses[size] || sizeClasses.md}
            transform transition-all duration-200 ease-out
            ${className}
          `}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-200">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-neutral-900"
                >
                  {title}
                </h2>
              )}

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                    p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100
                    rounded-lg transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-brand-sky focus:ring-offset-2
                  "
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal Header component
export const ModalHeader = ({ children, className = '', ...props }) => (
  <div className={`pb-4 border-b border-neutral-200 ${className}`} {...props}>
    {children}
  </div>
);

// Modal Title component
export const ModalTitle = ({ children, className = '', ...props }) => (
  <h2 className={`text-xl font-semibold text-neutral-900 ${className}`} {...props}>
    {children}
  </h2>
);

// Modal Subtitle component
export const ModalSubtitle = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-neutral-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

// Modal Content component
export const ModalContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Modal Footer component
export const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-4 border-t border-neutral-200 flex items-center justify-end space-x-3 ${className}`} {...props}>
    {children}
  </div>
);

// Confirm Modal component
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'destructive',
  size = 'sm',
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      closeOnOverlayClick={false}
      {...props}
    >
      <ModalContent>
        <p className="text-neutral-700">{message}</p>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-sky focus:ring-offset-2 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            confirmVariant === 'destructive'
              ? 'bg-feedback-danger hover:bg-red-700 focus:ring-red-500'
              : 'bg-brand-midnight hover:bg-brand-ocean focus:ring-brand-sky'
          }`}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// Alert Modal component
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  type = 'info',
  confirmText = 'OK',
  size = 'sm',
  ...props
}) => {
  const typeClasses = {
    info: 'text-brand-sky',
    success: 'text-feedback-success',
    warning: 'text-feedback-warning',
    error: 'text-feedback-danger',
  };

  const typeIcons = {
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      {...props}
    >
      <ModalContent>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${typeClasses[type]}`}>
            {typeIcons[type]}
          </div>
          <div className="flex-1">
            <p className="text-neutral-700">{message}</p>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-white bg-brand-midnight rounded-lg hover:bg-brand-ocean focus:outline-none focus:ring-2 focus:ring-brand-sky focus:ring-offset-2 transition-colors"
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

Modal.displayName = 'Modal';
ConfirmModal.displayName = 'ConfirmModal';
AlertModal.displayName = 'AlertModal';

export default Modal;
