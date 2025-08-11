import React, { useState, useRef, useEffect } from 'react';
import { useFadeIn } from '../../hooks/useFadeIn';

const Tabs = ({
  tabs = [],
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className = '',
  defaultActiveTab = 0,
  onTabChange,
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [focusedTab, setFocusedTab] = useState(-1);
  const tabRefs = useRef([]);
  const tabListRef = useRef(null);
  const fadeInRef = useFadeIn();

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
    xl: 'text-xl px-8 py-4'
  };

  const variantClasses = {
    underline: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      active: 'border-midnight text-midnight',
      disabled: 'text-gray-400 cursor-not-allowed hover:text-gray-400 hover:border-transparent'
    },
    pills: {
      container: 'space-x-1',
      tab: 'rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100',
      active: 'bg-midnight text-white hover:bg-midnight',
      disabled: 'text-gray-400 cursor-not-allowed hover:text-gray-400 hover:bg-transparent'
    }
  };

  useEffect(() => {
    if (onTabChange) {
      onTabChange(activeTab, tabs[activeTab]);
    }
  }, [activeTab, onTabChange, tabs]);

  const handleTabClick = (index) => {
    if (tabs[index]?.disabled) return;
    setActiveTab(index);
  };

  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : tabs.length - 1;
        if (!tabs[prevIndex]?.disabled) {
          setActiveTab(prevIndex);
          tabRefs.current[prevIndex]?.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = index < tabs.length - 1 ? index + 1 : 0;
        if (!tabs[nextIndex]?.disabled) {
          setActiveTab(nextIndex);
          tabRefs.current[nextIndex]?.focus();
        }
        break;
      case 'Home':
        event.preventDefault();
        const firstEnabledIndex = tabs.findIndex(tab => !tab.disabled);
        if (firstEnabledIndex !== -1) {
          setActiveTab(firstEnabledIndex);
          tabRefs.current[firstEnabledIndex]?.focus();
        }
        break;
      case 'End':
        event.preventDefault();
        const lastEnabledIndex = tabs.length - 1 - tabs.slice().reverse().findIndex(tab => !tab.disabled);
        if (lastEnabledIndex !== -1) {
          setActiveTab(lastEnabledIndex);
          tabRefs.current[lastEnabledIndex]?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleTabClick(index);
        break;
    }
  };

  const handleTabFocus = (index) => {
    setFocusedTab(index);
  };

  const handleTabBlur = () => {
    setFocusedTab(-1);
  };

  if (!tabs.length) return null;

  return (
    <div className={`${className}`} {...props}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Tabs"
        className={`
          flex ${fullWidth ? 'w-full' : 'w-auto'}
          ${variantClasses[variant].container}
        `}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          const isDisabled = tab.disabled;
          const isFocused = index === focusedTab;

          return (
            <button
              key={tab.id || index}
              ref={(el) => (tabRefs.current[index] = el)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-disabled={isDisabled}
              aria-controls={`panel-${tab.id || index}`}
              disabled={isDisabled}
              onClick={() => handleTabClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => handleTabFocus(index)}
              onBlur={handleTabBlur}
              className={`
                flex items-center justify-center font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-midnight focus:ring-offset-2
                ${sizeClasses[size]}
                ${fullWidth ? 'flex-1' : ''}
                ${variantClasses[variant].tab}
                ${isActive ? variantClasses[variant].active : ''}
                ${isDisabled ? variantClasses[variant].disabled : ''}
                ${isFocused ? 'ring-2 ring-midnight ring-offset-2' : ''}
              `}
            >
              {tab.icon && (
                <span className={`mr-2 ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.badge && (
                <span className={`
                  ml-2 px-2 py-0.5 text-xs font-medium rounded-full
                  ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        ref={fadeInRef}
        role="tabpanel"
        id={`panel-${tabs[activeTab]?.id || activeTab}`}
        aria-labelledby={`tab-${tabs[activeTab]?.id || activeTab}`}
        className="mt-6"
        data-fade
      >
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

// Tab component for easier tab definition
export const Tab = ({ id, label, content, icon, badge, disabled = false }) => ({
  id,
  label,
  content,
  icon,
  badge,
  disabled
});

export default Tabs; 