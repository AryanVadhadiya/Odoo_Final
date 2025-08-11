import React from 'react';

const Card = React.forwardRef(({
  children,
  variant = 'default',
  className = '',
  onClick,
  hoverable = true,
  padding = 'default',
  ...props
}, ref) => {
  // Base card classes
  const baseClasses = 'bg-white rounded-lg border border-neutral-200 transition-all duration-200';

  // Variant classes
  const variantClasses = {
    default: 'shadow-sm',
    glass: 'glass-card',
    trip: 'trip-card',
    elevated: 'shadow-lg',
    outline: 'border-2 border-neutral-300',
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  // Hover classes
  const hoverClasses = hoverable ? 'hover:shadow-md hover:-translate-y-1' : '';

  // Clickable classes
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const cardClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    paddingClasses[padding] || paddingClasses.default,
    hoverClasses,
    clickableClasses,
    className,
  ].filter(Boolean).join(' ');

  const CardComponent = onClick ? 'button' : 'div';

  return (
    <CardComponent
      ref={ref}
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardComponent>
  );
});

// Card Header component
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`pb-4 ${className}`} {...props}>
    {children}
  </div>
);

// Card Title component
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-neutral-900 ${className}`} {...props}>
    {children}
  </h3>
);

// Card Subtitle component
export const CardSubtitle = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-neutral-600 ${className}`} {...props}>
    {children}
  </p>
);

// Card Content component
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Card Footer component
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-4 border-t border-neutral-200 ${className}`} {...props}>
    {children}
  </div>
);

// Trip Card component
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
    description,
    startDate,
    endDate,
    status,
    coverImage,
    destination,
    budget,
    stops = [],
  } = trip || {};

  // Format dates
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || statusColors.planning;
  };

  // Calculate trip duration
  const getDuration = () => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <Card
      ref={ref}
      variant="trip"
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 -mx-6 -mt-6 mb-4">
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            {name}
          </h3>
          {description && (
            <p className="text-neutral-600 text-sm line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Trip Details */}
        <div className="space-y-2">
          {destination && (
            <div className="flex items-center text-sm text-neutral-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {destination}
            </div>
          )}

          <div className="flex items-center text-sm text-neutral-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {startDate && endDate ? (
              <>
                {formatDate(startDate)} - {formatDate(endDate)}
                <span className="ml-2 text-neutral-500">({getDuration()})</span>
              </>
            ) : (
              'Dates TBD'
            )}
          </div>

          {stops.length > 0 && (
            <div className="flex items-center text-sm text-neutral-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </div>
          )}

          {budget && (
            <div className="flex items-center text-sm text-neutral-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Budget: ${budget.toLocaleString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(trip);
                }}
                className="text-brand-ocean hover:text-brand-midnight text-sm font-medium"
              >
                View Details
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(trip);
                }}
                className="p-2 text-neutral-600 hover:text-brand-ocean hover:bg-neutral-100 rounded-lg transition-colors"
                title="Edit trip"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(trip);
                }}
                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete trip"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
});

TripCard.displayName = 'TripCard';

export default Card;
