// Debounce and throttle utility functions

/**
 * Debounce function - delays execution until after a specified delay
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @returns {Function} Debounced function
 */
export function debounce(func, delay, immediate = false) {
  let timeoutId;

  return function executedFunction(...args) {
    const later = () => {
      timeoutId = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeoutId;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delay);

    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function - limits execution to once per specified interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce with leading and trailing options
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Options object
 * @param {boolean} options.leading - Execute on leading edge
 * @param {boolean} options.trailing - Execute on trailing edge
 * @returns {Function} Debounced function
 */
export function debounceAdvanced(func, delay, options = {}) {
  const { leading = false, trailing = true } = options;
  let timeoutId;
  let lastCallTime;
  let lastExecTime;

  return function executedFunction(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - (lastCallTime || 0);
    const timeSinceLastExec = now - (lastExecTime || 0);

    lastCallTime = now;

    const later = () => {
      timeoutId = null;
      lastExecTime = Date.now();
      if (trailing) func.apply(this, args);
    };

    const callNow = leading && timeSinceLastCall >= delay;

    if (callNow) {
      lastExecTime = now;
      func.apply(this, args);
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delay);
  };
}

/**
 * Throttle with leading and trailing options
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @param {Object} options - Options object
 * @param {boolean} options.leading - Execute on leading edge
 * @param {boolean} options.trailing - Execute on trailing edge
 * @returns {Function} Throttled function
 */
export function throttleAdvanced(func, limit, options = {}) {
  const { leading = true, trailing = true } = options;
  let timeoutId;
  let lastExecTime = 0;

  return function executedFunction(...args) {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeSinceLastExec >= limit) {
      if (leading) {
        lastExecTime = now;
        func.apply(this, args);
      }
    } else if (trailing) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastExecTime = Date.now();
        func.apply(this, args);
      }, limit - timeSinceLastExec);
    }
  };
}

/**
 * Debounce for search input with immediate execution on first call
 * @param {Function} searchFunc - Search function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} Debounced search function
 */
export function debounceSearch(searchFunc, delay = 300) {
  return debounce(searchFunc, delay, false);
}

/**
 * Throttle for scroll events
 * @param {Function} scrollFunc - Scroll function to throttle
 * @param {number} limit - Time limit in milliseconds (default: 16 for 60fps)
 * @returns {Function} Throttled scroll function
 */
export function throttleScroll(scrollFunc, limit = 16) {
  return throttle(scrollFunc, limit);
}

/**
 * Debounce for resize events
 * @param {Function} resizeFunc - Resize function to debounce
 * @param {number} delay - Delay in milliseconds (default: 250)
 * @returns {Function} Debounced resize function
 */
export function debounceResize(resizeFunc, delay = 250) {
  return debounce(resizeFunc, delay, false);
}

// Export default debounce function
export default debounce;
