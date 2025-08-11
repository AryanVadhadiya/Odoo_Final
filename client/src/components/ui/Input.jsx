import React from 'react';

const Input = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  fullWidth = false,
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  // Base input classes
  const baseClasses = 'input-field';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Error classes
  const errorClasses = error ? 'input-error' : '';

  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Icon classes
  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Icon wrapper classes
  const iconWrapperClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-4',
  };

  const inputClasses = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    widthClasses,
    errorClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  // Render icon
  const renderIcon = (iconComponent, position) => {
    if (!iconComponent) return null;

    const iconElement = React.isValidElement(iconComponent)
      ? React.cloneElement(iconComponent, { className: iconClasses[size] })
      : iconComponent;

    return (
      <div className={`absolute inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} flex items-center ${iconWrapperClasses[size]}`}>
        <div className={`text-neutral-400 ${position === 'right' ? 'ml-2' : 'mr-2'}`}>
          {iconElement}
        </div>
      </div>
    );
  };

  // Input wrapper classes
  const wrapperClasses = [
    'relative',
    widthClasses,
  ].filter(Boolean).join(' ');

  // Input with icon padding
  const inputWithIconClasses = icon ? [
    inputClasses,
    iconPosition === 'left' ? 'pl-12' : 'pr-12',
  ].join(' ') : inputClasses;

  return (
    <div className={wrapperClasses}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-feedback-danger ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && renderIcon(icon, 'left')}

        {/* Input Field */}
        <input
          ref={ref}
          className={inputWithIconClasses}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id || 'input'}-error` : helperText ? `${props.id || 'input'}-helper` : undefined}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && renderIcon(icon, 'right')}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${props.id || 'input'}-helper`} className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${props.id || 'input'}-error`} className="mt-1 text-sm text-feedback-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

// Textarea component
export const Textarea = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  fullWidth = false,
  size = 'md',
  rows = 4,
  className = '',
  ...props
}, ref) => {
  // Base textarea classes
  const baseClasses = 'input-field resize-none';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Error classes
  const errorClasses = error ? 'input-error' : '';

  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const textareaClasses = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    widthClasses,
    errorClasses,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={widthClasses}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-feedback-danger ml-1">*</span>}
        </label>
      )}

      {/* Textarea Field */}
      <textarea
        ref={ref}
        className={textareaClasses}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id || 'textarea'}-error` : helperText ? `${props.id || 'textarea'}-helper` : undefined}
        {...props}
      />

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${props.id || 'textarea'}-helper`} className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${props.id || 'textarea'}-error`} className="mt-1 text-sm text-feedback-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

// Search Input component
export const SearchInput = React.forwardRef(({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = '',
  ...props
}, ref) => {
  const [searchValue, setSearchValue] = React.useState('');

  // Debounced search effect
  React.useEffect(() => {
    if (!onSearch) return;

    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch, debounceMs]);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        iconPosition="left"
        className={className}
        {...props}
      />
    </div>
  );
});

// File Input component
export const FileInput = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  fullWidth = false,
  accept,
  multiple = false,
  onFileSelect,
  className = '',
  ...props
}, ref) => {
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (onFileSelect) {
      onFileSelect(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);

    if (onFileSelect) {
      onFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-feedback-danger ml-1">*</span>}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        required={required}
        {...props}
      />

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer
          hover:border-brand-ocean hover:bg-neutral-50 transition-colors
          ${error ? 'border-feedback-danger' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <svg className="mx-auto h-12 w-12 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="mt-4">
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-brand-ocean hover:text-brand-midnight">
              Click to upload
            </span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
            {multiple && ' (Multiple files allowed)'}
          </p>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 text-left">
            <p className="text-sm font-medium text-neutral-700 mb-2">Selected files:</p>
            <ul className="text-sm text-neutral-600 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-neutral-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-feedback-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
SearchInput.displayName = 'SearchInput';
FileInput.displayName = 'FileInput';

export default Input;
