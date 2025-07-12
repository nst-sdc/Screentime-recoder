import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Helper function to communicate with extension
  const sendTokenToExtension = (authToken) => {
    try {
      window.postMessage({
        type: "EXTENSION_AUTH",
        token: authToken
      }, window.location.origin);
    } catch (error) {
      console.warn("Extension communication failed:", error);
    }
  };

  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Listen for extension availability and auth success
  useEffect(() => {
    const handleExtensionMessage = (event) => {
      console.log("Received message:", event.data, "from origin:", event.origin);
      
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === "EXTENSION_AVAILABLE") {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          sendTokenToExtension(currentToken);
        }
      } else if (event.data.type === "EXTENSION_AUTH_SUCCESS") {
        console.log("Extension authentication successful");
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => {
      window.removeEventListener("message", handleExtensionMessage);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await axios.get('/auth/verify');
          setUser(res.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Token verification failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('token', urlToken);

      sendTokenToExtension(urlToken);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const login = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Email + Password registration
  const registerUser = async (userData) => {
    try {
      const res = await axios.post('/auth/register', userData);
      
      if (res.data.success) {
        const jwt = res.data.token;
        const userData = res.data.data;

        localStorage.setItem('token', jwt);
        setToken(jwt);
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

        setUser(userData);
        setIsAuthenticated(true);
        sendTokenToExtension(jwt);
        
        return res.data;
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      
      // Handle different error types
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const loginWithCredentials = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const jwt = res.data.token;
        const userData = res.data.data;

        localStorage.setItem('token', jwt);
        setToken(jwt);
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

        // Send token to extension
        sendTokenToExtension(jwt);

        const userRes = await axios.get('/auth/verify');
        setUser(userRes.data.data);
        setIsAuthenticated(true);
        
        return res.data;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      
      // Handle different error types
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await axios.put('/auth/profile', data);
      setUser(res.data.data);
      return res.data;
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete('/auth/account');
      logout();
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    loginWithCredentials,
    registerUser,
    logout,
    updateProfile,
    deleteAccount,
    api: axios,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
