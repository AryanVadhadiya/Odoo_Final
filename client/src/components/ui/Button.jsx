import React from 'react';

/**
 * Button component with multiple variants and sizes
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-midnight-900 text-white hover:bg-midnight-800 focus-visible:ring-midnight-500 active:bg-midnight-900',
    secondary: 'bg-white text-midnight-900 border border-midnight-200 hover:bg-midnight-50 hover:border-midnight-300 focus-visible:ring-midnight-500 active:bg-midnight-50',
    ghost: 'bg-transparent text-midnight-800 hover:bg-midnight-50 hover:text-midnight-900 focus-visible:ring-midnight-500 active:bg-midnight-100',
    destructive: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500 active:bg-danger-800',
    outline: 'bg-white text-midnight-900 border border-midnight-300 hover:bg-midnight-50 hover:border-midnight-400 focus-visible:ring-midnight-500 active:bg-midnight-100',
    glass: 'bg-white/30 text-midnight-900 border border-white/40 backdrop-blur-sm hover:bg-white/40 focus-visible:ring-midnight-500 active:bg-white/50',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    widthClasses,
    className,
  ].filter(Boolean).join(' ');
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 