import React, { forwardRef } from 'react';
import { X, Check } from 'lucide-react';

const Chip = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  selected = false,
  disabled = false,
  onClick,
  onRemove,
  className = '',
  icon,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-5 py-2.5 text-lg'
  };

  const variantClasses = {
    default: {
      base: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
      selected: 'bg-midnight text-white border-midnight hover:bg-midnight',
      disabled: 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
    },
    primary: {
      base: 'bg-midnight text-white border-midnight hover:bg-ocean',
      selected: 'bg-ocean text-white border-ocean hover:bg-ocean',
      disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
    },
    secondary: {
      base: 'bg-sky text-white border-sky hover:bg-ocean',
      selected: 'bg-ocean text-white border-ocean hover:bg-ocean',
      disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
    },
    success: {
      base: 'bg-success text-white border-success hover:bg-success/90',
      selected: 'bg-success text-white border-success hover:bg-success/90',
      disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
    },
    warning: {
      base: 'bg-warning text-white border-warning hover:bg-warning/90',
      selected: 'bg-warning text-white border-warning hover:bg-warning/90',
      disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
    },
    danger: {
      base: 'bg-danger text-white border-danger hover:bg-danger/90',
      selected: 'bg-danger text-white border-danger hover:bg-danger/90',
      disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
    },
    outline: {
      base: 'bg-transparent text-midnight border-midnight hover:bg-midnight hover:text-white',
      selected: 'bg-midnight text-white border-midnight hover:bg-midnight',
      disabled: 'bg-transparent text-gray-400 border-gray-300 cursor-not-allowed'
    },
    glass: {
      base: 'bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30',
      selected: 'bg-white/40 text-white border-white/50 backdrop-blur-sm hover:bg-white/40',
      disabled: 'bg-white/10 text-white/50 border-white/20 cursor-not-allowed'
    }
  };

  const isInteractive = onClick && !disabled;
  const isRemovable = removable && !disabled;
  
  let currentVariant = variantClasses[variant];
  if (disabled) {
    currentVariant = variantClasses.default; // Use default variant for disabled state
  }

  const getVariantClasses = () => {
    if (disabled) return currentVariant.disabled;
    if (selected) return currentVariant.selected;
    return currentVariant.base;
  };

  const handleClick = (event) => {
    if (disabled) return;
    if (onClick) {
      onClick(event);
    }
  };

  const handleRemove = (event) => {
    event.stopPropagation();
    if (disabled) return;
    if (onRemove) {
      onRemove(event);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      if (isRemovable) {
        event.preventDefault();
        handleRemove(event);
      }
    }
  };

  return (
    <div
      ref={ref}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${isInteractive ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && (
        <span className={`mr-1.5 ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'}`}>
          {icon}
        </span>
      )}
      
      <span className="flex-1">{children}</span>
      
      {selected && !removable && (
        <Check className={`ml-1.5 ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'}`} />
      )}
      
      {isRemovable && (
        <button
          type="button"
          onClick={handleRemove}
          onKeyDown={(e) => e.stopPropagation()}
          className={`
            ml-1.5 rounded-full p-0.5 transition-colors duration-200
            hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1
            ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'}
          `}
          aria-label="Remove chip"
        >
          <X className="w-full h-full" />
        </button>
      )}
    </div>
  );
});

Chip.displayName = 'Chip';

export default Chip; 