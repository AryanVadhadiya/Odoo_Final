import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {Array} [storedValue, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove value from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Custom hook for managing localStorage with expiration
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Array} [storedValue, setValue, removeValue]
 */
export function useLocalStorageWithExpiry(key, initialValue, ttl) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      const now = new Date().getTime();
      
      // Check if item has expired
      if (parsed.expiry && now > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      
      return parsed.value;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Calculate expiry time
      const expiry = ttl ? new Date().getTime() + ttl : null;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage with expiry
      const itemToStore = {
        value: valueToStore,
        expiry,
      };
      
      window.localStorage.setItem(key, JSON.stringify(itemToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Custom hook for managing form drafts in localStorage
 * @param {string} key - The localStorage key
 * @param {Object} initialValue - Initial form values
 * @param {number} ttl - Time to live in milliseconds (default: 24 hours)
 * @returns {Object} Form draft state and handlers
 */
export function useFormDraft(key, initialValue = {}, ttl = 24 * 60 * 60 * 1000) {
  const [draft, setDraft, removeDraft] = useLocalStorageWithExpiry(key, initialValue, ttl);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateDraft = (updates) => {
    const newDraft = { ...draft, ...updates };
    setDraft(newDraft);
    setHasUnsavedChanges(true);
  };

  const saveDraft = () => {
    setHasUnsavedChanges(false);
  };

  const clearDraft = () => {
    removeDraft();
    setHasUnsavedChanges(false);
  };

  const resetDraft = () => {
    setDraft(initialValue);
    setHasUnsavedChanges(false);
  };

  return {
    draft,
    hasUnsavedChanges,
    updateDraft,
    saveDraft,
    clearDraft,
    resetDraft,
  };
}

/**
 * Custom hook for managing user preferences in localStorage
 * @param {string} key - The localStorage key
 * @param {Object} defaultPreferences - Default preference values
 * @returns {Object} Preferences state and handlers
 */
export function usePreferences(key, defaultPreferences = {}) {
  const [preferences, setPreferences] = useLocalStorage(key, defaultPreferences);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updatePreferences = (updates) => {
    setPreferences(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const getPreference = (key, defaultValue = null) => {
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  };

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    getPreference,
  };
} 