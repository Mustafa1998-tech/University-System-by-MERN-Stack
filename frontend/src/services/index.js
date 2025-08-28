// API Services
export { default as apiService } from './apiService';
export { default as authService } from './authService';
export { default as studentService } from './studentService';
export { default as instructorService } from './instructorService';
export { default as adminService } from './adminService';
export { default as courseService } from './courseService';
export { default as libraryService } from './libraryService';
export { default as eventService } from './eventService';

// Re-export the main API client for direct use
export { apiClient } from './apiService';