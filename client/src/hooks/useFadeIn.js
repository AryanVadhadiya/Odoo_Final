import { useEffect, useRef, useState } from 'react';
import { addFadeEffect, removeFadeEffect } from '../lib/fadeObserver';

/**
 * Custom hook for fade-in animations using Intersection Observer
 * @param {Object} options - Animation options
 * @param {number} options.delay - Delay before animation starts (ms)
 * @param {string} options.direction - Animation direction ('up', 'down', 'left', 'right')
 * @param {boolean} options.once - Whether animation should only happen once
 * @returns {Object} Ref and animation state
 */
export const useFadeIn = (options = {}) => {
  const {
    delay = 0,
    direction = 'up',
    once = true,
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add fade effect
    addFadeEffect(element, delay);

    // Set up intersection observer for custom logic
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              setHasAnimated(true);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      removeFadeEffect(element);
    };
  }, [delay, direction, once]);

  // Add direction-specific classes
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isVisible && !hasAnimated) {
      element.classList.add(`fade-${direction}`);
    }
  }, [isVisible, hasAnimated, direction]);

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
  };
};

/**
 * Custom hook for staggered fade-in animations
 * @param {number} count - Number of elements
 * @param {Object} options - Animation options
 * @param {number} options.delay - Base delay between elements (ms)
 * @param {string} options.direction - Animation direction
 * @returns {Array} Array of refs and animation states
 */
export const useStaggeredFadeIn = (count, options = {}) => {
  const {
    delay = 100,
    direction = 'up',
  } = options;

  const refs = Array.from({ length: count }, () => useRef(null));
  const states = Array.from({ length: count }, (_, index) =>
    useFadeIn({
      delay: index * delay,
      direction,
      once: true,
    })
  );

  return refs.map((ref, index) => ({
    ref,
    ...states[index],
  }));
};

/**
 * Custom hook for fade-in with scroll trigger
 * @param {Object} options - Animation options
 * @param {number} options.threshold - Scroll threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @returns {Object} Ref and animation state
 */
export const useScrollFadeIn = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    delay = 0,
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, delay]);

  return {
    ref: elementRef,
    isVisible,
  };
};

/**
 * Custom hook for fade-in with hover trigger
 * @param {Object} options - Animation options
 * @param {number} options.delay - Delay before animation starts (ms)
 * @returns {Object} Ref and animation state
 */
export const useHoverFadeIn = (options = {}) => {
  const { delay = 0 } = options;
  const elementRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      setTimeout(() => {
        setIsHovered(true);
      }, delay);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [delay]);

  return {
    ref: elementRef,
    isHovered,
  };
};

export default useFadeIn;
