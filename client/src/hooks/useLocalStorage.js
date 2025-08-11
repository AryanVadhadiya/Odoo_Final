import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {Array} [storedValue, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in localStorage and state
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save to state
      setStoredValue(valueToStore);

      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage and state
  const removeValue = useCallback(() => {
    try {
      // Remove from state
      setStoredValue(initialValue);

      // Remove from localStorage
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Update state when localStorage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Custom hook for managing localStorage with object values
 * @param {string} key - The localStorage key
 * @param {Object} initialValue - Initial object value
 * @returns {Array} [storedObject, setObjectValue, updateObjectValue, removeObject]
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
  const [storedObject, setStoredObject, removeObject] = useLocalStorage(key, initialValue);

  // Update specific properties of the stored object
  const updateObjectValue = useCallback((updates) => {
    setStoredObject(prev => ({
      ...prev,
      ...updates,
    }));
  }, [setStoredObject]);

  // Set specific property value
  const setObjectProperty = useCallback((property, value) => {
    setStoredObject(prev => ({
      ...prev,
      [property]: value,
    }));
  }, [setStoredObject]);

  // Get specific property value
  const getObjectProperty = useCallback((property) => {
    return storedObject[property];
  }, [storedObject]);

  // Remove specific property
  const removeObjectProperty = useCallback((property) => {
    setStoredObject(prev => {
      const newObj = { ...prev };
      delete newObj[property];
      return newObj;
    });
  }, [setStoredObject]);

  return [
    storedObject,
    setStoredObject,
    updateObjectValue,
    setObjectProperty,
    getObjectProperty,
    removeObjectProperty,
    removeObject,
  ];
};

/**
 * Custom hook for managing localStorage with array values
 * @param {string} key - The localStorage key
 * @param {Array} initialValue - Initial array value
 * @returns {Array} [storedArray, setArrayValue, addArrayItem, removeArrayItem, updateArrayItem]
 */
export const useLocalStorageArray = (key, initialValue = []) => {
  const [storedArray, setStoredArray, removeArray] = useLocalStorage(key, initialValue);

  // Add item to array
  const addArrayItem = useCallback((item) => {
    setStoredArray(prev => [...prev, item]);
  }, [setStoredArray]);

  // Remove item from array by index
  const removeArrayItem = useCallback((index) => {
    setStoredArray(prev => prev.filter((_, i) => i !== index));
  }, [setStoredArray]);

  // Remove item from array by value
  const removeArrayItemByValue = useCallback((value) => {
    setStoredArray(prev => prev.filter(item => item !== value));
  }, [setStoredArray]);

  // Update item in array by index
  const updateArrayItem = useCallback((index, newValue) => {
    setStoredArray(prev => prev.map((item, i) => i === index ? newValue : item));
  }, [setStoredArray]);

  // Find item in array
  const findArrayItem = useCallback((predicate) => {
    return storedArray.find(predicate);
  }, [storedArray]);

  // Filter array
  const filterArray = useCallback((predicate) => {
    return storedArray.filter(predicate);
  }, [storedArray]);

  // Clear array
  const clearArray = useCallback(() => {
    setStoredArray([]);
  }, [setStoredArray]);

  return [
    storedArray,
    setStoredArray,
    addArrayItem,
    removeArrayItem,
    removeArrayItemByValue,
    updateArrayItem,
    findArrayItem,
    filterArray,
    clearArray,
    removeArray,
  ];
};

/**
 * Custom hook for managing localStorage with form data
 * @param {string} key - The localStorage key
 * @param {Object} initialValue - Initial form values
 * @returns {Array} [formData, setFormData, updateFormField, resetForm, clearForm]
 */
export const useLocalStorageForm = (key, initialValue = {}) => {
  const [formData, setFormData, removeForm] = useLocalStorage(key, initialValue);

  // Update specific form field
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, [setFormData]);

  // Update multiple form fields
  const updateFormFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  }, [setFormData]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormData(initialValue);
  }, [setFormData, initialValue]);

  // Clear form data
  const clearForm = useCallback(() => {
    setFormData({});
  }, [setFormData]);

  // Validate form data
  const validateForm = useCallback((validationRules) => {
    const errors = {};

    Object.keys(validationRules).forEach(field => {
      const value = formData[field];
      const rules = validationRules[field];

      if (rules.required && (!value || value.trim() === '')) {
        errors[field] = `${field} is required`;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        errors[field] = rules.message || `${field} format is invalid`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [formData]);

  return [
    formData,
    setFormData,
    updateFormField,
    updateFormFields,
    resetForm,
    clearForm,
    validateForm,
    removeForm,
  ];
};

export default useLocalStorage;
