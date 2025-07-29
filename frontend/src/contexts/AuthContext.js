import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { access_token, ...userData } = response.data.data;
        localStorage.setItem('token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(userData);
        toast.success('Login successful!');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        const { access_token, ...userInfo } = response.data.data;
        localStorage.setItem('token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(userInfo);
        toast.success('Registration successful!');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
