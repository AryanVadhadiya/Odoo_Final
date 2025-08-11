import React from 'react';
import Chip from '../ui/Chip';
import { X } from 'lucide-react';

const FilterChips = ({
  filters = [],
  onRemoveFilter,
  onClearAll,
  variant = 'default',
  size = 'md',
  maxVisible = 5,
  showClearAll = true,
  className = '',
  ...props
}) => {
  if (!filters || filters.length === 0) return null;

  const visibleFilters = filters.slice(0, maxVisible);
  const hiddenCount = filters.length - maxVisible;

  const handleRemoveFilter = (filter) => {
    onRemoveFilter?.(filter);
  };

  const handleClearAll = () => {
    onClearAll?.();
  };

  const getFilterLabel = (filter) => {
    if (typeof filter === 'string') return filter;
    if (typeof filter === 'object' && filter.label) return filter.label;
    if (typeof filter === 'object' && filter.value) return filter.value;
    return String(filter);
  };

  const getFilterValue = (filter) => {
    if (typeof filter === 'string') return filter;
    if (typeof filter === 'object' && filter.value) return filter.value;
    return filter;
  };

  const getFilterKey = (filter, index) => {
    if (typeof filter === 'object' && filter.id) return filter.id;
    if (typeof filter === 'object' && filter.key) return filter.key;
    return `${getFilterValue(filter)}-${index}`;
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} {...props}>
      {/* Visible Filter Chips */}
      {visibleFilters.map((filter, index) => (
        <Chip
          key={getFilterKey(filter, index)}
          variant={variant}
          size={size}
          removable
          onRemove={() => handleRemoveFilter(filter)}
          className="transition-all duration-200 hover:scale-105"
        >
          {getFilterLabel(filter)}
        </Chip>
      ))}

      {/* Hidden Count Indicator */}
      {hiddenCount > 0 && (
        <Chip
          variant="outline"
          size={size}
          className="bg-gray-50 text-gray-600 border-gray-300"
        >
          +{hiddenCount} more
        </Chip>
      )}

      {/* Clear All Button */}
      {showClearAll && filters.length > 1 && (
        <button
          type="button"
          onClick={handleClearAll}
          className={`
            inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600
            hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-midnight focus:ring-offset-2
          `}
          aria-label="Clear all filters"
        >
          <X className="w-4 h-4 mr-1" />
          Clear all
        </button>
      )}
    </div>
  );
};

// FilterChips with different variants for common use cases
export const SearchFilters = ({ filters, onRemoveFilter, onClearAll, ...props }) => (
  <FilterChips
    filters={filters}
    onRemoveFilter={onRemoveFilter}
    onClearAll={onClearAll}
    variant="primary"
    size="sm"
    {...props}
  />
);

export const CategoryFilters = ({ filters, onRemoveFilter, onClearAll, ...props }) => (
  <FilterChips
    filters={filters}
    onRemoveFilter={onRemoveFilter}
    onClearAll={onClearAll}
    variant="secondary"
    size="md"
    {...props}
  />
);

export const TagFilters = ({ filters, onRemoveFilter, onClearAll, ...props }) => (
  <FilterChips
    filters={filters}
    onRemoveFilter={onRemoveFilter}
    onClearAll={onClearAll}
    variant="outline"
    size="sm"
    {...props}
  />
);

export default FilterChips; 