import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/me/');
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const login = async (credentials) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const response = await api.post('/login/', {
        username: credentials.username,
        password: credentials.password
      });
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Fetch user data
      const userResponse = await api.get('/me/');
      setUser(userResponse.data);
      
      setAuthLoading(false);
      return response.data;
    } catch (err) {
      setAuthLoading(false);
      const errorMsg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (userData) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const response = await api.post('/register/', {
        username: userData.username,
        password: userData.password,
        email: userData.email || ''
      });
      
      setAuthLoading(false);
      return response.data;
    } catch (err) {
      setAuthLoading(false);
      const errorMsg = err.response?.data?.error || 'Registration failed.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    authLoading,
    authError,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
