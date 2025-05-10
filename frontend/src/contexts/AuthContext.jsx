import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/api';
import axios from 'axios';

// Create a non-authenticated axios instance for login
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function - using publicApi without auth headers
  const login = async (username, password) => {
    try {
      setLoading(true);
      // Use publicApi instead of apiService for login
      const response = await publicApi.post('/users/login', { username, password });
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update state
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.users.update(user.id, userData);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Update state
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Value to be provided by the context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 