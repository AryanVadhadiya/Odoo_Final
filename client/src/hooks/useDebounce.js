import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced search
 * @param {string} initialValue - Initial search value
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} Search state and handlers
 */
export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setIsSearching(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    setIsSearching,
    handleSearchChange,
    clearSearch,
  };
} 