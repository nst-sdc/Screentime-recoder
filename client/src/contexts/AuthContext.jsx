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

  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

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

      try {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage(
            import.meta.env.VITE_APP_EXTENSION_ID,
            {
              type: "AUTH_SUCCESS",
              token: urlToken
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log("Extension communication failed:", chrome.runtime.lastError.message);
              } else {
                console.log("Token sent to extension:", response);
              }
            }
          );
        }
      } catch (error) {
        console.log("Extension not available:", error);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const login = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const loginWithCredentials = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const jwt = res.data.token;

      localStorage.setItem('token', jwt);
      setToken(jwt);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

      // ✅ Send token to extension
      try {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage(
            import.meta.env.VITE_APP_EXTENSION_ID,
            {
              type: "SET_TOKEN",
              token: jwt,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error("Extension communication failed:", chrome.runtime.lastError.message);
              } else {
                console.log("Token sent to extension:", response);
              }
            }
          );
        }
      } catch (err) {
        console.error("Failed to send token to extension:", err);
      }

      const userRes = await axios.get('/auth/verify');
      setUser(userRes.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
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
    logout,
    updateProfile,
    deleteAccount,
    api: axios,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
