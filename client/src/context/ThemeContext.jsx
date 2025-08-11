import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [systemTheme, setSystemTheme] = useState('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${currentTheme}`);
    
    // Update body class for Tailwind dark mode
    if (currentTheme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [theme, systemTheme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setSystemThemePreference = () => setTheme('system');

  const getCurrentTheme = () => {
    return theme === 'system' ? systemTheme : theme;
  };

  const isDark = () => getCurrentTheme() === 'dark';
  const isLight = () => getCurrentTheme() === 'light';

  const value = {
    theme,
    systemTheme,
    currentTheme: getCurrentTheme(),
    isDark: isDark(),
    isLight: isLight(),
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemThemePreference,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 