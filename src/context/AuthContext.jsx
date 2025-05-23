// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// 1. Create the context
const AuthContext = createContext();

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to get token expiration time
const getTokenExpirationTime = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to check if token needs refresh (5 minutes before expiration)
const shouldRefreshToken = (token) => {
  if (!token) return false;
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return false;
  
  // Refresh if token expires in less than 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= expirationTime - fiveMinutes;
};

// Add axios interceptor to handle token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log("Trying to refresh token with API");
          const response = await axios.post('http://localhost:5000/api/refresh-token', {
            refreshToken
          });

          const { token } = response.data;
          localStorage.setItem('token', token);
          console.log("Token refreshed successfully");

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh token fails, logout user
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Token refresh function
  const refreshToken = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('token');
      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (!currentToken || !refreshTokenValue) {
        console.log("No tokens available for refresh");
        throw new Error('No tokens available');
      }

      console.log("Checking if token needs refresh...");
      if (shouldRefreshToken(currentToken)) {
        console.log("Token needs refreshing, sending request");
        const response = await axios.post('http://localhost:5000/api/refresh-token', {
          refreshToken: refreshTokenValue
        });

        const { token } = response.data;
        localStorage.setItem('token', token);
        console.log("Token refreshed in refresh function");

        // Schedule next token refresh
        const expirationTime = getTokenExpirationTime(token);
        if (expirationTime) {
          const timeUntilRefresh = Math.max(0, expirationTime - Date.now() - 5 * 60 * 1000);
          setTimeout(refreshToken, timeUntilRefresh);
          console.log(`Next token refresh scheduled in ${timeUntilRefresh/1000/60} minutes`);
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out user, clearing storage");
    // Clear all auth-related storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('sessionActive');

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });

    // Notify other tabs about logout
    window.dispatchEvent(new Event('auth:logout'));
  }, []);

  // Initialize auth and set up token refresh
  useEffect(() => {
    console.log("Initializing auth context");
    const initializeAuth = async () => {
      console.log("Checking for stored authentication data");
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');
      let userData = null;
      
      try {
        userData = userDataStr ? JSON.parse(userDataStr) : null;
      } catch (e) {
        console.error("Error parsing stored user data:", e);
      }

      console.log("Token exists:", !!token, "User data exists:", !!userData);
      
      if (token && userData) {
        try {
          // First, verify the token is valid by decoding it
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            console.log("Token is expired, attempting refresh");
            // Token is expired, try to refresh it
            await refreshToken();
          }

          console.log("Verifying token with API");
          // Verify token and get fresh user data
          const response = await api.get('/verify-token');
          console.log("Token verification response:", response.data);
          
          if (response.data.isValid) {
            const freshUserData = response.data.user;
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(freshUserData));
            sessionStorage.setItem('sessionActive', 'true');
            
            console.log("Setting authenticated state with user:", freshUserData);
            setAuthState({
              user: freshUserData,
              isAuthenticated: true,
              isLoading: false
            });

            // Set up periodic token refresh
            const expirationTime = getTokenExpirationTime(token);
            if (expirationTime) {
              const timeUntilRefresh = Math.max(0, expirationTime - Date.now() - 5 * 60 * 1000);
              console.log(`Scheduling token refresh in ${timeUntilRefresh/1000/60} minutes`);
              setTimeout(refreshToken, timeUntilRefresh);
            }
          } else {
            console.log("Token is invalid, logging out");
            logout();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          logout();
        }
      } else {
        console.log("No authentication data found, setting unauthenticated state");
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    // Listen for logout events (e.g., from other tabs)
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);

    // Listen for storage changes (e.g., token removed in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        logout();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshToken, logout]);

  const login = async (token, userData, refreshTokenValue = null) => {
    console.log("Login called with token and user data:", !!token, userData);
    
    if (!token) {
      console.error("No token provided to login function");
      return;
    }
    
    localStorage.setItem('token', token);
    
    if (refreshTokenValue) {
      console.log("Saving refresh token");
      localStorage.setItem('refreshToken', refreshTokenValue);
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set session storage to track active session
    sessionStorage.setItem('sessionActive', 'true');
    
    console.log("Setting authenticated state after login");
    setAuthState({
      user: userData,
      isAuthenticated: true,
      isLoading: false
    });

    // Set up token refresh after login
    const expirationTime = getTokenExpirationTime(token);
    if (expirationTime) {
      const timeUntilRefresh = Math.max(0, expirationTime - Date.now() - 5 * 60 * 1000);
      console.log(`Scheduling initial token refresh in ${timeUntilRefresh/1000/60} minutes`);
      setTimeout(refreshToken, timeUntilRefresh);
    }
  };

  // Method to check if session is active
  const isSessionActive = () => {
    return !!localStorage.getItem('token') && !!sessionStorage.getItem('sessionActive');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        logout,
        isSessionActive,
        api,
        refreshToken // Expose refresh token function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create and export the hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};