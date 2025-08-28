import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services';

// Create auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get redirect path based on role
  const getRedirectPath = (role) => {
    const from = location.state?.from?.pathname || '/';
    
    // If coming from a specific page, redirect there
    if (from !== '/' && from !== '/login') {
      return from;
    }
    
    // Default redirects based on role
    switch (role) {
      case 'student':
        return '/student-dashboard';
      case 'instructor':
        return '/instructor-dashboard';
      case 'staff':
        return '/staff-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        
        // Redirect based on role
        const redirectPath = getRedirectPath(response.user.role);
        navigate(redirectPath);
        
        return response;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.error });
        return response;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      
      // Redirect to login
      navigate('/login');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        // Registration successful, but user might need to verify email
        dispatch({ type: 'LOGOUT' }); // Keep logged out until verification
        return response;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.error });
        return response;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROFILE', payload: response.data.user });
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    
    if (user && isAuthenticated) {
      dispatch({ type: 'SET_USER', payload: user });
    }
  }, []);

  // Refresh profile data periodically
  useEffect(() => {
    let interval;
    
    if (state.isAuthenticated) {
      // Refresh profile every 15 minutes
      interval = setInterval(async () => {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            dispatch({ type: 'UPDATE_PROFILE', payload: response.data.user });
          }
        } catch (error) {
          console.error('Profile refresh error:', error);
        }
      }, 15 * 60 * 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isAuthenticated]);

  // Check if user has specific role
  const hasRole = (role) => {
    return authService.hasRole(role);
  };
  
  // Check if user has permission
  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  // Get current user
  const getCurrentUser = () => {
    return state.user || authService.getCurrentUser();
  };

  // Context value
  const value = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
    hasRole,
    hasPermission,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;