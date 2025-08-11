import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} The debounced value
 */
export const useDebounce = (value, delay) => {
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
};

/**
 * Custom hook for debouncing with immediate option
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @returns {any} The debounced value
 */
export const useDebounceImmediate = (value, delay, immediate = false) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isFirstCall, setIsFirstCall] = useState(true);

  useEffect(() => {
    if (immediate && isFirstCall) {
      setDebouncedValue(value);
      setIsFirstCall(false);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, immediate, isFirstCall]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing search queries
 * @param {string} query - The search query to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {string} The debounced search query
 */
export const useDebounceSearch = (query, delay = 300) => {
  return useDebounce(query, delay);
};

/**
 * Custom hook for debouncing form inputs
 * @param {any} value - The form input value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {any} The debounced form value
 */
export const useDebounceForm = (value, delay = 500) => {
  return useDebounce(value, delay);
};

/**
 * Custom hook for debouncing window resize events
 * @param {number} delay - Delay in milliseconds (default: 250)
 * @returns {Object} The debounced window dimensions
 */
export const useDebounceResize = (delay = 250) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const debouncedHandleResize = useDebounce(handleResize, delay);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [delay]);

  return dimensions;
};

export default useDebounce;
