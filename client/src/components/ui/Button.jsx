import React from 'react';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-midnight text-white hover:bg-brand-ocean focus:ring-brand-sky',
    secondary: 'bg-white/80 backdrop-blur-sm text-brand-midnight border border-neutral-200 hover:bg-white hover:shadow-md focus:ring-brand-sky',
    ghost: 'text-brand-midnight hover:bg-neutral-100 focus:ring-brand-sky',
    destructive: 'bg-feedback-danger text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-transparent text-brand-midnight border border-brand-midnight hover:bg-brand-midnight hover:text-white focus:ring-brand-sky',
    link: 'text-brand-ocean hover:text-brand-midnight underline-offset-4 hover:underline focus:ring-brand-sky',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Icon classes
  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className={`animate-spin ${iconClasses[size]}`}
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
  );

  // Render icon
  const renderIcon = (iconComponent, position) => {
    if (!iconComponent) return null;

    const iconElement = React.isValidElement(iconComponent)
      ? React.cloneElement(iconComponent, { className: iconClasses[size] })
      : iconComponent;

    return (
      <span className={`inline-flex items-center ${position === 'right' ? 'ml-2' : 'mr-2'}`}>
        {iconElement}
      </span>
    );
  };

  // Button content
  const buttonContent = (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && iconPosition === 'left' && renderIcon(icon, 'left')}
          {children}
          {icon && iconPosition === 'right' && renderIcon(icon, 'right')}
        </>
      )}
    </>
  );

  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    widthClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
