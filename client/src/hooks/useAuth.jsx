import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { authAPI } from '../lib/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getProfile();
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('accessToken');
      setUser(null);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(credentials);
      console.log('Login API response:', response.data);
      const { accessToken, refreshToken, user } = response.data;
      console.log('Extracted user data:', user);

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      console.log('Setting user state with:', user);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup function
  const signup = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.signup(userData);
      const { accessToken, refreshToken, user: newUser } = response.data;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API if token exists
      const token = localStorage.getItem('accessToken');
      if (token) {
        await authAPI.logout();
      }
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setError(null);
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token, password) => {
    try {
      setLoading(true);
      setError(null);

      await authAPI.resetPassword(token, password);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data;

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('accessToken');
  }, [user]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) || user?.role === role;
  }, [user]);

  // Check if user has permission
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission);
  }, [user]);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    clearError,
    isAuthenticated,
    hasRole,
    hasPermission,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export auth context for direct usage if needed
export { AuthContext };
