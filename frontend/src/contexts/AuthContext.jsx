import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Token refresh interval (25 minutes)
  const REFRESH_INTERVAL = 25 * 60 * 1000;

  // Clear all auth-related data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // Clear all cached API responses
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  // Check auth status on initial load
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        clearAuthData();
        return;
      }

      const { data } = await authAPI.getMe();
      setUser(data.user);
      setIsAuthenticated(true);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, [clearAuthData]);

  // Handle token refresh
  const handleTokenRefresh = useCallback(async () => {
    try {
      const { data } = await authAPI.refreshToken();
      localStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      return false;
    }
  }, [clearAuthData]);

  // Setup token refresh interval
  useEffect(() => {
    checkAuth();
    
    const refreshInterval = setInterval(() => {
      if (isAuthenticated) {
        handleTokenRefresh();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [checkAuth, handleTokenRefresh, isAuthenticated, REFRESH_INTERVAL]);

  // Login function
  const loginUser = async (credentials) => {
    try {
      setLoading(true);
      clearAuthData();
      
      const { data } = await authAPI.login(credentials);
      
      localStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`, {
        icon: '👋',
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        },
      });
      
      const from = location.state?.from?.pathname || getDefaultRoute(data.user.role);
      navigate(from, { replace: true });
      
      return true;
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message.includes('password') 
          ? 'Incorrect password' 
          : error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        },
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      clearAuthData();
      
      const { data } = await authAPI.register(userData);
      
      localStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome to AgriCart, ${data.user.name.split(' ')[0]}!`, {
        icon: '🎉',
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        },
      });
      
      navigate(getDefaultRoute(data.user.role));
      
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Registration failed';
      
      toast.error(errorMessage, {
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        },
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(false);
    
    toast.success('Logged out successfully!', {
      icon: '👋',
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
      },
    });
    
    navigate('/login');
  }, [clearAuthData, navigate]);

  // Helper functions
  const getDefaultRoute = (role) => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'farmer': return '/farmer/dashboard';
      default: return '/';
    }
  };

  const updateUserData = useCallback((updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const hasRole = useCallback((role) => user?.role === role, [user]);
  const hasAnyRole = useCallback((roles) => roles.includes(user?.role), [user]);

  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }), []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      isAuthenticated,
      authChecked,
      loginUser, 
      registerUser, 
      logout,
      checkAuth,
      updateUserData,
      hasRole,
      hasAnyRole,
      getAuthHeaders
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};