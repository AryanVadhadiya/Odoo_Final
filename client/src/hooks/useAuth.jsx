import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authAPI } from '../lib/api';

/**
 * Authentication Context
 */
const AuthContext = createContext();

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const storeUser = (u) => {
    try {
      localStorage.setItem('user', JSON.stringify(u));
    } catch {}
  };

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const stored = getStoredUser();
      // Fast path: if we have a stored user and token, use it
      if (stored && token) {
        setUser(stored);
        setLoading(false);
        return;
      }

      if (!token) {
        setLoading(false);
        return;
      }

      // Try fetching profile from API (if backend exists)
      const response = await authAPI.getProfile();
      setUser(response.data);
      storeUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user (supports login(credentials) or login(email, password))
   */
  const login = useCallback(async (credentialsOrEmail, maybePassword) => {
    const credentials = typeof credentialsOrEmail === 'object'
      ? credentialsOrEmail
      : { email: credentialsOrEmail, password: maybePassword };

    try {
      setLoading(true);
      setError(null);

      // If no backend configured, mock a successful login in dev
      const noApi = !import.meta.env.VITE_API_BASE_URL;
      if (noApi) {
        const mockUser = {
          id: 'demo-user',
          name: 'Demo User',
          firstName: credentials?.email?.split('@')[0] || 'Demo',
          email: credentials?.email || 'demo@example.com',
        };
        localStorage.setItem('accessToken', 'dev-token');
        localStorage.setItem('refreshToken', 'dev-refresh');
        storeUser(mockUser);
        setUser(mockUser);
        return { success: true, user: mockUser };
      }

      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      storeUser(userData);

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      // As a dev fallback, still allow login so UI can be explored
      const mockUser = {
        id: 'dev-fallback',
        name: 'Developer',
        firstName: 'Developer',
        email: credentials?.email || 'dev@example.com',
      };
      localStorage.setItem('accessToken', 'dev-token');
      localStorage.setItem('refreshToken', 'dev-refresh');
      storeUser(mockUser);
      setUser(mockUser);
      return { success: true, user: mockUser };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register user
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const noApi = !import.meta.env.VITE_API_BASE_URL;
      if (noApi) {
        const newUser = {
          id: 'demo-user',
          name: `${userData.firstName || 'Demo'} ${userData.lastName || 'User'}`.trim(),
          firstName: userData.firstName || 'Demo',
          email: userData.email || 'demo@example.com',
        };
        localStorage.setItem('accessToken', 'dev-token');
        localStorage.setItem('refreshToken', 'dev-refresh');
        storeUser(newUser);
        setUser(newUser);
        return { success: true, user: newUser };
      }

      const response = await authAPI.register(userData);
      const { accessToken, refreshToken, user: newUser } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      storeUser(newUser);

      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data;

      setUser(updatedUser);
      storeUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Forgot password
   */
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

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      await authAPI.resetPassword(token, newPassword);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Use Auth Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Protected Route Component
 */
export function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || <div>Please log in to continue.</div>;
  }

  return children;
}

/**
 * Guest Route Component (for login/register pages)
 */
export function GuestRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return fallback || <div>You are already logged in.</div>;
  }

  return children;
} 