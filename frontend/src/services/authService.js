import apiService from './apiService';

export const authService = {
  // User authentication
  login: async (credentials) => {
    const response = await apiService.post('/auth/login', credentials);
    
    if (response.success) {
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user,
        message: response.message
      };
    }
    
    return response;
  },

  // User registration
  register: async (userData) => {
    const response = await apiService.post('/auth/register', userData);
    return response;
  },

  // Logout
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      await apiService.post('/auth/logout', { refreshToken });
    }
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return { success: true };
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }
    
    const response = await apiService.post('/auth/refresh', { refreshToken });
    
    if (response.success) {
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
    }
    
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiService.post('/auth/forgot-password', { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiService.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiService.patch('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await apiService.post('/auth/verify-email', { token });
    return response;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await apiService.post('/auth/resend-verification', { email });
    return response;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiService.get('/auth/profile');
    
    if (response.success) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiService.patch('/auth/profile', profileData);
    
    if (response.success) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Upload profile avatar
  uploadAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await apiService.upload('/auth/avatar', formData);
    
    if (response.success) {
      // Update stored user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.avatar = response.data.avatar;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response;
  },

  // Enable/disable two-factor authentication
  toggleTwoFactor: async (enabled, secret) => {
    const response = await apiService.patch('/auth/two-factor', {
      enabled,
      secret
    });
    return response;
  },

  // Get user sessions
  getSessions: async () => {
    const response = await apiService.get('/auth/sessions');
    return response;
  },

  // Terminate session
  terminateSession: async (sessionId) => {
    const response = await apiService.delete(`/auth/sessions/${sessionId}`);
    return response;
  },

  // Terminate all sessions
  terminateAllSessions: async () => {
    const response = await apiService.delete('/auth/sessions');
    return response;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user from local storage
  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    try {
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check user role
  hasRole: (requiredRole) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  },

  // Check user permissions
  hasPermission: (permission) => {
    const user = authService.getCurrentUser();
    if (!user || !user.permissions) return false;
    
    return user.permissions.includes(permission);
  }
};

export default authService;