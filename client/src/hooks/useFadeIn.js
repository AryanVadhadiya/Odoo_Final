import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for fade-in animations using Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @returns {Object} Ref and visibility state
 */
export function useFadeIn(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
    ...options,
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (defaultOptions.triggerOnce) {
            setHasAnimated(true);
            observer.unobserve(element);
          }
        } else if (!defaultOptions.triggerOnce) {
          setIsVisible(false);
        }
      },
      defaultOptions
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [defaultOptions.threshold, defaultOptions.rootMargin, defaultOptions.triggerOnce]);

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
  };
}

/**
 * Custom hook for staggered fade-in animations
 * @param {number} count - Number of items to animate
 * @param {Object} options - Animation options
 * @returns {Array} Array of refs and visibility states
 */
export function useStaggeredFadeIn(count, options = {}) {
  const [visibilities, setVisibilities] = useState(new Array(count).fill(false));
  const refs = useRef([]);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 100,
    ...options,
  };

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisibilities(new Array(count).fill(true));
      return;
    }

    const observers = [];

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibilities(prev => {
              const newVisibilities = [...prev];
              newVisibilities[index] = true;
              return newVisibilities;
            });

            // Stagger the animation
            setTimeout(() => {
              observer.unobserve(element);
            }, index * defaultOptions.staggerDelay);
          }
        },
        defaultOptions
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [count, defaultOptions.threshold, defaultOptions.rootMargin, defaultOptions.staggerDelay]);

  const getRef = (index) => (element) => {
    refs.current[index] = element;
  };

  return {
    refs: refs.current,
    getRef,
    visibilities,
  };
}

/**
 * Custom hook for scroll-triggered fade-in
 * @param {Object} options - Animation options
 * @returns {Object} Ref and scroll state
 */
export function useScrollFadeIn(options = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  const defaultOptions = {
    threshold: 100,
    ...options,
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);

      if (elementRef.current) {
        const elementTop = elementRef.current.offsetTop;
        const elementHeight = elementRef.current.offsetHeight;
        const windowHeight = window.innerHeight;

        if (scrollPosition + windowHeight > elementTop + defaultOptions.threshold) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [defaultOptions.threshold]);

  return {
    ref: elementRef,
    scrollY,
    isVisible,
  };
}

/**
 * Custom hook for hover-triggered fade-in
 * @param {Object} options - Animation options
 * @returns {Object} Ref and hover state
 */
export function useHoverFadeIn(options = {}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  const defaultOptions = {
    delay: 200,
    ...options,
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let timeoutId;

    const handleMouseEnter = () => {
      setIsHovered(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, defaultOptions.delay);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      clearTimeout(timeoutId);
      setIsVisible(false);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }, [defaultOptions.delay]);

  return {
    ref: elementRef,
    isHovered,
    isVisible,
  };
} 