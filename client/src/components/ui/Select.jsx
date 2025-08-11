import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = forwardRef(({
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  fullWidth = false,
  size = 'md',
  placeholder = 'Select an option',
  options = [],
  value,
  onChange,
  onBlur,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const listboxRef = useRef(null);

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-12 text-lg',
    xl: 'h-14 text-xl'
  };

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      listboxRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm('');
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm('');
        break;
    }
  };

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
    setSearchTerm('');
    onBlur?.();
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    }
  };

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          ref={ref}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${label}-label` : undefined}
          className={`
            relative w-full text-left bg-white border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-midnight focus:border-midnight
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${sizeClasses[size]}
            ${fullWidth ? 'w-full' : 'w-auto'}
          `}
          {...props}
        >
          <span className={`block truncate ${!displayValue ? 'text-gray-400' : 'text-gray-900'} px-3 py-2`}>
            {displayValue || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-midnight focus:border-midnight"
                onKeyDown={handleKeyDown}
              />
            </div>
            
            <ul
              ref={listboxRef}
              role="listbox"
              aria-labelledby={label ? `${label}-label` : undefined}
              className="py-1"
              tabIndex={-1}
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500 text-center">
                  No options found
                </li>
              ) : (
                filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    className={`
                      relative cursor-pointer select-none px-3 py-2 text-sm
                      hover:bg-midnight hover:text-white
                      ${option.value === value ? 'bg-midnight text-white' : 'text-gray-900'}
                      ${focusedIndex === index ? 'bg-midnight text-white' : ''}
                    `}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className="block truncate">{option.label}</span>
                    {option.value === value && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select; 