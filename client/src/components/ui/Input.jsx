import React from 'react';

/**
 * Input component with labels, helper text, and error states
 */
const Input = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'form-input transition-all duration-200';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-3 py-2 text-sm h-10',
    lg: 'px-4 py-3 text-base h-12',
  };
  
  const stateClasses = error 
    ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' 
    : 'border-midnight-200 focus:border-ocean-500 focus:ring-ocean-500';
  
  const disabledClasses = disabled ? 'bg-midnight-50 text-midnight-500 cursor-not-allowed' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const inputClasses = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    stateClasses,
    disabledClasses,
    widthClasses,
    className,
  ].filter(Boolean).join(' ');
  
  const iconClasses = icon 
    ? iconPosition === 'left' 
      ? 'pl-10' 
      : 'pr-10'
    : '';
  
  const finalInputClasses = `${inputClasses} ${iconClasses}`;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="form-label"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-midnight-400">
              {icon}
            </span>
          </div>
        )}
        
        {/* Input Element */}
        <input
          ref={ref}
          id={inputId}
          className={finalInputClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : 
            undefined
          }
          {...props}
        />
        
        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-midnight-400">
              {icon}
            </span>
          </div>
        )}
      </div>
      
      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="text-sm text-midnight-600"
        >
          {helperText}
        </p>
      )}
      
      {/* Error Message */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="form-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
});

/**
 * Textarea component
 */
export const Textarea = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  fullWidth = true,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const inputId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'form-input transition-all duration-200 resize-vertical';
  
  const stateClasses = error 
    ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' 
    : 'border-midnight-200 focus:border-ocean-500 focus:ring-ocean-500';
  
  const disabledClasses = disabled ? 'bg-midnight-50 text-midnight-500 cursor-not-allowed' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const textareaClasses = [
    baseClasses,
    stateClasses,
    disabledClasses,
    widthClasses,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="form-label"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Textarea Element */}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={textareaClasses}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${inputId}-error` : 
          helperText ? `${inputId}-helper` : 
          undefined
        }
        {...props}
      />
      
      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="text-sm text-midnight-600"
        >
          {helperText}
        </p>
      )}
      
      {/* Error Message */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="form-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
});

/**
 * Search Input component
 */
export const SearchInput = React.forwardRef(({
  onSearch,
  placeholder = 'Search...',
  className = '',
  ...props
}, ref) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch?.('');
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-midnight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        ref={ref}
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-input pl-10 pr-10 w-full"
        {...props}
      />
      
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-midnight-400 hover:text-midnight-600"
          aria-label="Clear search"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
SearchInput.displayName = 'SearchInput';

export default Input; 