import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add language header
    const language = localStorage.getItem('language') || 'ar';
    config.headers['Accept-Language'] = language;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const errorMessage = error.response.data?.message || 'An error occurred';
      error.message = errorMessage;
    }

    return Promise.reject(error);
  }
);

// API response wrapper
const apiRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Success',
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred',
      data: null,
    };
  }
};

// Generic CRUD operations
export const apiService = {
  // GET request
  get: (url, params = {}) =>
    apiRequest(() => apiClient.get(url, { params })),

  // POST request
  post: (url, data = {}) =>
    apiRequest(() => apiClient.post(url, data)),

  // PUT request
  put: (url, data = {}) =>
    apiRequest(() => apiClient.put(url, data)),

  // PATCH request
  patch: (url, data = {}) =>
    apiRequest(() => apiClient.patch(url, data)),

  // DELETE request
  delete: (url) =>
    apiRequest(() => apiClient.delete(url)),

  // File upload
  upload: (url, formData) =>
    apiRequest(() =>
      apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    ),

  // File download
  download: async (url, filename) => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      // Create blob link to download
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || 'download';
      link.click();

      return { success: true };
    } catch (error) {
      console.error('Download Error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Export axios instance for direct use if needed
export { apiClient };
export default apiService;