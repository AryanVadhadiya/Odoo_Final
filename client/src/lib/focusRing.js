/**
 * Focus Ring Utility
 * Detects when user is tabbing (keyboard navigation) vs using mouse
 * Adds 'user-tabbing' class to body when Tab key is used
 */

let isTabbing = false;
let mouseTimeout;

/**
 * Initialize focus ring detection
 * Call this once when the app starts
 */
export function initFocusRing() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  const body = document.body;

  // Handle keydown events
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isTabbing = true;
      body.classList.add('user-tabbing');
      
      // Clear any existing timeout
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
    }
  });

  // Handle mouse events
  document.addEventListener('mousedown', () => {
    isTabbing = false;
    body.classList.remove('user-tabbing');
  });

  // Handle touch events (mobile)
  document.addEventListener('touchstart', () => {
    isTabbing = false;
    body.classList.remove('user-tabbing');
  });

  // Handle focus events to maintain tabbing state
  document.addEventListener('focusin', (e) => {
    if (isTabbing) {
      body.classList.add('user-tabbing');
    }
  });

  // Handle focus events to maintain tabbing state
  document.addEventListener('focusout', (e) => {
    // Small delay to allow focus to move to next element
    setTimeout(() => {
      if (!document.activeElement || document.activeElement === body) {
        // If no element is focused, remove the class
        body.classList.remove('user-tabbing');
      }
    }, 10);
  });

  // Handle window blur/focus (when switching tabs)
  window.addEventListener('blur', () => {
    body.classList.remove('user-tabbing');
  });

  window.addEventListener('focus', () => {
    if (isTabbing) {
      body.classList.add('user-tabbing');
    }
  });
}

/**
 * Check if user is currently tabbing
 * @returns {boolean} True if user is using keyboard navigation
 */
export function isUserTabbing() {
  return isTabbing;
}

/**
 * Force remove the user-tabbing class
 * Useful for programmatic focus changes
 */
export function removeTabbingClass() {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('user-tabbing');
    isTabbing = false;
  }
}

/**
 * Add the user-tabbing class
 * Useful for programmatic focus changes that should show focus rings
 */
export function addTabbingClass() {
  if (typeof document !== 'undefined') {
    document.body.classList.add('user-tabbing');
    isTabbing = true;
  }
}

/**
 * Get the current tabbing state
 * @returns {boolean} True if user-tabbing class is present on body
 */
export function hasTabbingClass() {
  if (typeof document === 'undefined') return false;
  return document.body.classList.contains('user-tabbing');
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFocusRing);
  } else {
    initFocusRing();
  }
} 