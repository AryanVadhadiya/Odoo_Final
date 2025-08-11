import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  disabled = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    'top-left': 'bottom-full right-0 mb-2',
    'top-right': 'bottom-full left-0 mb-2',
    'bottom-left': 'top-full right-0 mt-2',
    'bottom-right': 'top-full left-0 mt-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900',
    'top-left': 'top-full right-4 border-t-gray-900',
    'top-right': 'top-full left-4 border-t-gray-900',
    'bottom-left': 'bottom-full right-4 border-b-gray-900',
    'bottom-right': 'bottom-full left-4 border-b-gray-900'
  };

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 + scrollX;
        y = triggerRect.top + scrollY;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 + scrollX;
        y = triggerRect.bottom + scrollY;
        break;
      case 'left':
        x = triggerRect.left + scrollX;
        y = triggerRect.top + triggerRect.height / 2 + scrollY;
        break;
      case 'right':
        x = triggerRect.right + scrollX;
        y = triggerRect.top + triggerRect.height / 2 + scrollY;
        break;
      case 'top-left':
        x = triggerRect.right + scrollX;
        y = triggerRect.top + scrollY;
        break;
      case 'top-right':
        x = triggerRect.left + scrollX;
        y = triggerRect.top + scrollY;
        break;
      case 'bottom-left':
        x = triggerRect.right + scrollX;
        y = triggerRect.bottom + scrollY;
        break;
      case 'bottom-right':
        x = triggerRect.left + scrollX;
        y = triggerRect.bottom + scrollY;
        break;
    }

    setCoords({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };

  if (disabled) {
    return <span {...props}>{children}</span>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onKeyDown={handleKeyDown}
        className={`inline-block ${className}`}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
        {...props}
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`
            fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            max-w-xs break-words pointer-events-none
            ${positionClasses[position]}
          `}
          style={{
            left: coords.x,
            top: coords.y,
            transform: positionClasses[position].includes('transform') ? '' : 'none'
          }}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4 border-transparent
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip; 