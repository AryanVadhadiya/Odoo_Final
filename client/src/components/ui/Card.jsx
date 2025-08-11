import React from 'react';

/**
 * Card component with glass effect and variants
 */
const Card = React.forwardRef(({
  children,
  variant = 'default',
  className = '',
  hover = true,
  glass = false,
  ...props
}, ref) => {
  const baseClasses = 'rounded-lg border transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border-midnight-200',
    glass: 'glass-card',
    elevated: 'bg-white border-midnight-200 shadow-md',
    outlined: 'bg-transparent border-midnight-300',
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-ocean-300' : '';
  const glassClasses = glass ? 'glass-card' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    hoverClasses,
    glassClasses,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * Card Header component
 */
export const CardHeader = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-midnight-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * Card Content component
 */
export const CardContent = React.forwardRef(({
  children,
  className = '',
  padding = true,
  ...props
}, ref) => {
  const paddingClasses = padding ? 'px-6 py-4' : '';
  
  return (
    <div
      ref={ref}
      className={`${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * Card Footer component
 */
export const CardFooter = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 border-t border-midnight-100 bg-midnight-50/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * Trip Card variant
 */
export const TripCard = React.forwardRef(({
  trip,
  onView,
  onEdit,
  onDelete,
  className = '',
  ...props
}, ref) => {
  const {
    name,
    startDate,
    endDate,
    destination,
    coverImage,
    status = 'planned',
    budget,
    stops = [],
  } = trip || {};
  
  const statusColors = {
    planned: 'bg-sky-100 text-sky-800',
    active: 'bg-success-100 text-success-800',
    completed: 'bg-midnight-100 text-midnight-800',
    cancelled: 'bg-danger-100 text-danger-800',
  };
  
  const statusLabels = {
    planned: 'Planned',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  
  return (
    <Card
      ref={ref}
      variant="elevated"
      className={`trip-card ${className}`}
      {...props}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.planned}`}>
              {statusLabels[status] || 'Planned'}
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-midnight-900 mb-1">
              {name}
            </h3>
            <p className="text-midnight-600 text-sm">
              {destination}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-midnight-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {startDate && new Date(startDate).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {stops.length} stops
              </span>
            </div>
            
            {budget && (
              <span className="font-medium text-midnight-900">
                ${budget.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Actions */}
      <CardFooter>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(trip)}
              className="text-midnight-700 hover:text-midnight-900"
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(trip)}
              className="text-midnight-700 hover:text-midnight-900"
            >
              Edit
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(trip)}
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
TripCard.displayName = 'TripCard';

export default Card; 