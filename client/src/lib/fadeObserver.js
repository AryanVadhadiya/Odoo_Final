/**
 * Fade Observer utility for adding fade-in animations to elements
 * Uses Intersection Observer API for performance
 */

/**
 * Fade Observer class for managing fade-in animations
 */
export class FadeObserver {
  constructor(options = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    };
    
    this.observer = null;
    this.elements = new Set();
    this.init();
  }
  
  init() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      this.fallback();
      return;
    }
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after animation to improve performance
          this.observer.unobserve(entry.target);
        }
      });
    }, this.options);
  }
  
  /**
   * Observe an element for fade-in animation
   * @param {Element} element - The element to observe
   */
  observe(element) {
    if (!this.observer) return;
    
    element.classList.add('fade-observer');
    element.classList.remove('is-visible');
    this.observer.observe(element);
    this.elements.add(element);
  }
  
  /**
   * Observe multiple elements
   * @param {Element[]|NodeList} elements - Elements to observe
   */
  observeAll(elements) {
    if (!Array.isArray(elements) && !elements instanceof NodeList) {
      elements = [elements];
    }
    
    elements.forEach(element => this.observe(element));
  }
  
  /**
   * Stop observing an element
   * @param {Element} element - The element to stop observing
   */
  unobserve(element) {
    if (!this.observer) return;
    
    this.observer.unobserve(element);
    this.elements.delete(element);
  }
  
  /**
   * Disconnect the observer
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.elements.clear();
  }
  
  /**
   * Fallback for browsers without Intersection Observer
   */
  fallback() {
    console.warn('Intersection Observer not supported, using fallback');
    
    // Simple fallback: show all elements immediately
    document.querySelectorAll('[data-fade]').forEach(element => {
      element.classList.add('is-visible');
    });
  }
}

/**
 * Initialize fade observer for all elements with data-fade attribute
 * @param {Object} options - Observer options
 * @returns {FadeObserver} The fade observer instance
 */
export function initFadeObserver(options = {}) {
  const observer = new FadeObserver(options);
  
  // Auto-observe elements with data-fade attribute
  document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('[data-fade]');
    observer.observeAll(fadeElements);
  });
  
  return observer;
}

/**
 * Create a fade observer for a specific container
 * @param {Element} container - The container element
 * @param {Object} options - Observer options
 * @returns {FadeObserver} The fade observer instance
 */
export function createContainerFadeObserver(container, options = {}) {
  const observer = new FadeObserver({
    root: container,
    ...options
  });
  
  return observer;
}

/**
 * Utility function to add fade animation to elements
 * @param {string} selector - CSS selector for elements
 * @param {Object} options - Observer options
 */
export function addFadeAnimation(selector, options = {}) {
  const observer = new FadeObserver(options);
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.setAttribute('data-fade', '');
    observer.observe(element);
  });
  
  return observer;
}

// Default export
export default FadeObserver; 