/**
 * Debounce utility functions for performance optimization
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - If true, trigger the function on the leading edge
 * @returns {Function} The debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle invocations to
 * @param {Object} options - Options object
 * @param {boolean} options.leading - Specify invoking on the leading edge of the timeout
 * @param {boolean} options.trailing - Specify invoking on the trailing edge of the timeout
 * @returns {Function} The throttled function
 */
export function throttle(func, wait, options = {}) {
  let timeout, context, args, result;
  let previous = 0;
  
  const { leading = true, trailing = true } = options;
  
  const later = () => {
    previous = leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  
  return function throttled(...params) {
    const now = Date.now();
    
    if (!previous && leading === false) previous = now;
    
    const remaining = wait - (now - previous);
    context = this;
    args = params;
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    
    return result;
  };
}

/**
 * Debounced search function specifically for search inputs
 * @param {Function} searchFunction - The search function to call
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} Debounced search function
 */
export function createDebouncedSearch(searchFunction, delay = 300) {
  return debounce(searchFunction, delay);
}

/**
 * Throttled scroll handler for performance
 * @param {Function} scrollHandler - The scroll handler function
 * @param {number} delay - Delay in milliseconds (default: 16 for 60fps)
 * @returns {Function} Throttled scroll handler
 */
export function createThrottledScroll(scrollHandler, delay = 16) {
  return throttle(scrollHandler, delay, { leading: true, trailing: true });
} 