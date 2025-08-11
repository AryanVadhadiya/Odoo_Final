import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal component with focus trap and keyboard navigation
 */
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
  const overlayRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus trap refs
  const focusableElements = useRef([]);
  const firstFocusableElement = useRef(null);
  const lastFocusableElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement.current) {
            e.preventDefault();
            lastFocusableElement.current?.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement.current) {
            e.preventDefault();
            firstFocusableElement.current?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Get all focusable elements within the modal
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    focusableElements.current = Array.from(
      modalRef.current.querySelectorAll(focusableSelectors.join(','))
    ).filter(el => el.offsetParent !== null); // Only visible elements

    if (focusableElements.current.length > 0) {
      firstFocusableElement.current = focusableElements.current[0];
      lastFocusableElement.current = focusableElements.current[focusableElements.current.length - 1];
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size] || sizeClasses.md} ${className}`}
        tabIndex={-1}
        role="document"
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-midnight-100">
            {title && (
              <h2 
                id="modal-title"
                className="text-lg font-semibold text-midnight-900"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-midnight-400 hover:text-midnight-600 hover:bg-midnight-50 rounded-md transition-colors duration-200"
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
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal using portal to avoid z-index issues
  return createPortal(modalContent, document.body);
};

/**
 * Modal Header component
 */
export const ModalHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-midnight-100 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Modal Content component
 */
export const ModalContent = ({ children, className = '', padding = true, ...props }) => {
  const paddingClasses = padding ? 'px-6 py-4' : '';
  
  return (
    <div className={`${paddingClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Modal Footer component
 */
export const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t border-midnight-100 bg-midnight-50/50 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Confirm Modal component
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  ...props
}) => {
  const variantClasses = {
    danger: 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500',
    warning: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
    primary: 'bg-midnight-900 hover:bg-midnight-800 focus:ring-midnight-500',
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <ModalContent>
        <p className="text-midnight-700 mb-6">
          {message}
        </p>
      </ModalContent>
      
      <ModalFooter>
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-midnight-700 bg-white border border-midnight-300 rounded-md hover:bg-midnight-50 hover:border-midnight-400 focus:outline-none focus:ring-2 focus:ring-midnight-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${variantClasses[variant] || variantClasses.danger}`}
          >
            {confirmText}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalContent.displayName = 'ModalContent';
ModalFooter.displayName = 'ModalFooter';
ConfirmModal.displayName = 'ConfirmModal';

export default Modal; 