// Focus Ring utility for detecting keyboard navigation
export class FocusRingManager {
  constructor() {
    this.isKeyboardUser = false;
    this.init();
  }

  init() {
    // Listen for keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Listen for mouse usage
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));

    // Listen for touch usage
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));

    // Set initial state
    this.updateBodyClass();
  }

  handleKeyDown(event) {
    // Check if it's a navigation key
    if (this.isNavigationKey(event.key)) {
      this.isKeyboardUser = true;
      this.updateBodyClass();
    }
  }

  handleMouseDown() {
    this.isKeyboardUser = false;
    this.updateBodyClass();
  }

  handleTouchStart() {
    this.isKeyboardUser = false;
    this.updateBodyClass();
  }

  isNavigationKey(key) {
    const navigationKeys = [
      'Tab',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'Enter',
      ' ',
      'Escape'
    ];

    return navigationKeys.includes(key);
  }

  updateBodyClass() {
    if (this.isKeyboardUser) {
      document.body.classList.add('user-tabbing');
    } else {
      document.body.classList.remove('user-tabbing');
    }
  }

  // Get current state
  get isUsingKeyboard() {
    return this.isKeyboardUser;
  }

  // Force keyboard mode (useful for testing)
  setKeyboardMode(enabled) {
    this.isKeyboardUser = enabled;
    this.updateBodyClass();
  }

  // Cleanup
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.body.classList.remove('user-tabbing');
  }
}

// Create a default instance
export const focusRingManager = new FocusRingManager();

// Export utility functions
export const isKeyboardUser = () => focusRingManager.isUsingKeyboard;

export const setKeyboardMode = (enabled) => focusRingManager.setKeyboardMode(enabled);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Already initialized
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  focusRingManager.destroy();
});
