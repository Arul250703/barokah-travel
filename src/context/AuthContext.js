import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Check localStorage for saved auth data
      const savedAuth = localStorage.getItem('authData');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        
        // Verify token is still valid (optional: check expiration)
        if (authData.token && authData.user) {
          // Optional: Verify token with backend
          // const response = await fetch('/api/verify-token', {
          //   headers: { 'Authorization': `Bearer ${authData.token}` }
          // });
          
          // For now, assume token is valid if it exists
          setUser(authData.user);
          setIsAuthenticated(true);
          
          // Set default axios headers if using axios
          // axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid auth data
      localStorage.removeItem('authData');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Support both email and username login
      const loginData = {
        ...credentials,
        // If username is provided, use it; otherwise use email
        identifier: credentials.username || credentials.email
      };
      
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save auth data
      const authData = {
        token: data.token,
        user: data.user,
        expiresAt: data.expiresAt || Date.now() + (24 * 60 * 60 * 1000) // 24 hours default
      };
      
      localStorage.setItem('authData', JSON.stringify(authData));
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Set default headers if using axios
      // axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Automatically login after successful registration
      if (data.token) {
        const authData = {
          token: data.token,
          user: data.user,
          expiresAt: data.expiresAt || Date.now() + (24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
        
        setUser(data.user);
        setIsAuthenticated(true);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Optional: Call logout endpoint to invalidate token on server
      // await fetch('/api/logout', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${getToken()}` }
      // });
      
      // Clear local storage
      localStorage.removeItem('authData');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear axios headers if using axios
      // delete axios.defaults.headers.common['Authorization'];
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    
    // Update localStorage
    const savedAuth = localStorage.getItem('authData');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      authData.user = updatedUser;
      localStorage.setItem('authData', JSON.stringify(authData));
    }
  };

  const getToken = () => {
    const savedAuth = localStorage.getItem('authData');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      return authData.token;
    }
    return null;
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isTokenExpired = () => {
    const savedAuth = localStorage.getItem('authData');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      return authData.expiresAt && Date.now() > authData.expiresAt;
    }
    return true;
  };

  // Auto logout when token expires
  useEffect(() => {
    if (isAuthenticated && isTokenExpired()) {
      logout();
    }
  }, [isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    getToken,
    isAdmin,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};