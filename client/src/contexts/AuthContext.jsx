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

  const sendTokenToExtension = (authToken) => {
    try {
      window.postMessage({
        type: "EXTENSION_AUTH",
        token: authToken
      }, window.location.origin);
    } catch (error) {
      // Silent fail for extension communication
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

  useEffect(() => {
    const handleExtensionMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === "EXTENSION_AVAILABLE") {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          sendTokenToExtension(currentToken);
        }
      } else if (event.data.type === "EXTENSION_AUTH_SUCCESS") {
        // Extension authentication successful
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
          // Only consider authenticated if the user's email is verified
          if (res.data.data && res.data.data.isEmailVerified) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (err) {
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
    const path = window.location.pathname || '';

    // Only treat a token query param as an auth JWT when on the OAuth success callback route.
    // This prevents other links (like email verification tokens) from being misinterpreted as JWTs.
    if (urlToken && (path === '/auth/success' || path.startsWith('/auth/success'))) {
      setToken(urlToken);
      localStorage.setItem('token', urlToken);

      sendTokenToExtension(urlToken);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const login = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const registerUser = async (userData) => {
    try {
      const res = await axios.post('/auth/register', userData);
      
      if (res.data.success) {
        // Don't automatically store or use the token returned on registration.
        // Registration returns a token for convenience but storing it would allow
        // immediate authenticated access before email verification. Instead,
        // only show a success message and require the user to verify their email
        // and then sign in.
        return res.data;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
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

        sendTokenToExtension(jwt);

        const userRes = await axios.get('/auth/verify');
        setUser(userRes.data.data);
        // only mark authenticated if email is verified
        if (userRes.data.data.isEmailVerified) setIsAuthenticated(true);

        return res.data;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const resendVerification = async (email) => {
    return axios.post('/auth/resend-verification', { email });
  };

  const forgotPassword = async (email) => {
    return axios.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token, email, password) => {
    return axios.post(`/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, { password });
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      // Silent fail for logout
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
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete('/auth/account');
      logout();
    } catch (err) {
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
