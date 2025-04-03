import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { login, register, getMe } from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check auth status on initial load
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await getMe();
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginUser = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await login(credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/');
      }
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      setLoading(true);
      const { data } = await register(userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (data.user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/');
      }
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      loginUser, 
      registerUser, 
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);