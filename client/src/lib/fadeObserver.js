// Fade Observer utility for adding fade-in animations to elements
export class FadeObserver {
  constructor(options = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    };

    this.observer = null;
    this.init();
  }

  init() {
    // Check if IntersectionObserver is supported
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

    // Observe all elements with data-fade attribute
    this.observeElements();
  }

  observeElements() {
    const elements = document.querySelectorAll('[data-fade]');
    elements.forEach(element => {
      this.observer.observe(element);
    });
  }

  observeElement(element) {
    if (this.observer && element) {
      this.observer.observe(element);
    }
  }

  unobserveElement(element) {
    if (this.observer && element) {
      this.observer.unobserve(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Fallback for browsers without IntersectionObserver
  fallback() {
    const elements = document.querySelectorAll('[data-fade]');
    elements.forEach(element => {
      element.classList.add('is-visible');
    });
  }

  // Refresh observer (useful for dynamic content)
  refresh() {
    this.disconnect();
    this.init();
  }
}

// Create a default instance
export const fadeObserver = new FadeObserver();

// Export a function to easily add fade effect to elements
export const addFadeEffect = (element, delay = 0) => {
  if (!element) return;

  element.setAttribute('data-fade', '');
  if (delay > 0) {
    element.style.animationDelay = `${delay}ms`;
  }

  fadeObserver.observeElement(element);
};

// Export a function to remove fade effect
export const removeFadeEffect = (element) => {
  if (!element) return;

  element.removeAttribute('data-fade');
  element.classList.remove('is-visible');
  fadeObserver.unobserveElement(element);
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fadeObserver.refresh();
  });
} else {
  fadeObserver.refresh();
}
