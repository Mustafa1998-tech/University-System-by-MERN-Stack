import apiService from './apiService';

export const adminService = {
  // User Management
  getAllUsers: async (params = {}) => {
    const response = await apiService.get('/admin/users', params);
    return response;
  },

  getUserById: async (userId) => {
    const response = await apiService.get(`/admin/users/${userId}`);
    return response;
  },

  createUser: async (userData) => {
    const response = await apiService.post('/admin/users', userData);
    return response;
  },

  updateUser: async (userId, userData) => {
    const response = await apiService.patch(`/admin/users/${userId}`, userData);
    return response;
  },

  deleteUser: async (userId) => {
    const response = await apiService.delete(`/admin/users/${userId}`);
    return response;
  },

  suspendUser: async (userId, reason) => {
    const response = await apiService.patch(`/admin/users/${userId}/suspend`, { reason });
    return response;
  },

  activateUser: async (userId) => {
    const response = await apiService.patch(`/admin/users/${userId}/activate`);
    return response;
  },

  resetUserPassword: async (userId) => {
    const response = await apiService.post(`/admin/users/${userId}/reset-password`);
    return response;
  },

  getUserSessions: async (userId) => {
    const response = await apiService.get(`/admin/users/${userId}/sessions`);
    return response;
  },

  terminateUserSessions: async (userId) => {
    const response = await apiService.delete(`/admin/users/${userId}/sessions`);
    return response;
  },

  // Student Management
  getAllStudents: async (params = {}) => {
    const response = await apiService.get('/admin/students', params);
    return response;
  },

  getStudentById: async (studentId) => {
    const response = await apiService.get(`/admin/students/${studentId}`);
    return response;
  },

  createStudent: async (studentData) => {
    const response = await apiService.post('/admin/students', studentData);
    return response;
  },

  updateStudent: async (studentId, studentData) => {
    const response = await apiService.patch(`/admin/students/${studentId}`, studentData);
    return response;
  },

  deleteStudent: async (studentId) => {
    const response = await apiService.delete(`/admin/students/${studentId}`);
    return response;
  },

  transferStudent: async (studentId, transferData) => {
    const response = await apiService.post(`/admin/students/${studentId}/transfer`, transferData);
    return response;
  },

  graduateStudent: async (studentId, graduationData) => {
    const response = await apiService.post(`/admin/students/${studentId}/graduate`, graduationData);
    return response;
  },

  // Instructor Management
  getAllInstructors: async (params = {}) => {
    const response = await apiService.get('/admin/instructors', params);
    return response;
  },

  getInstructorById: async (instructorId) => {
    const response = await apiService.get(`/admin/instructors/${instructorId}`);
    return response;
  },

  createInstructor: async (instructorData) => {
    const response = await apiService.post('/admin/instructors', instructorData);
    return response;
  },

  updateInstructor: async (instructorId, instructorData) => {
    const response = await apiService.patch(`/admin/instructors/${instructorId}`, instructorData);
    return response;
  },

  deleteInstructor: async (instructorId) => {
    const response = await apiService.delete(`/admin/instructors/${instructorId}`);
    return response;
  },

  assignInstructorToCourse: async (instructorId, courseId) => {
    const response = await apiService.post(`/admin/instructors/${instructorId}/courses`, { courseId });
    return response;
  },

  removeInstructorFromCourse: async (instructorId, courseId) => {
    const response = await apiService.delete(`/admin/instructors/${instructorId}/courses/${courseId}`);
    return response;
  },

  // Staff Management
  getAllStaff: async (params = {}) => {
    const response = await apiService.get('/admin/staff', params);
    return response;
  },

  getStaffById: async (staffId) => {
    const response = await apiService.get(`/admin/staff/${staffId}`);
    return response;
  },

  createStaff: async (staffData) => {
    const response = await apiService.post('/admin/staff', staffData);
    return response;
  },

  updateStaff: async (staffId, staffData) => {
    const response = await apiService.patch(`/admin/staff/${staffId}`, staffData);
    return response;
  },

  deleteStaff: async (staffId) => {
    const response = await apiService.delete(`/admin/staff/${staffId}`);
    return response;
  },

  // Course Management
  getAllCourses: async (params = {}) => {
    const response = await apiService.get('/admin/courses', params);
    return response;
  },

  getCourseById: async (courseId) => {
    const response = await apiService.get(`/admin/courses/${courseId}`);
    return response;
  },

  createCourse: async (courseData) => {
    const response = await apiService.post('/admin/courses', courseData);
    return response;
  },

  updateCourse: async (courseId, courseData) => {
    const response = await apiService.patch(`/admin/courses/${courseId}`, courseData);
    return response;
  },

  deleteCourse: async (courseId) => {
    const response = await apiService.delete(`/admin/courses/${courseId}`);
    return response;
  },

  getCourseEnrollments: async (courseId, params = {}) => {
    const response = await apiService.get(`/admin/courses/${courseId}/enrollments`, params);
    return response;
  },

  // Department Management
  getAllDepartments: async (params = {}) => {
    const response = await apiService.get('/admin/departments', params);
    return response;
  },

  getDepartmentById: async (departmentId) => {
    const response = await apiService.get(`/admin/departments/${departmentId}`);
    return response;
  },

  createDepartment: async (departmentData) => {
    const response = await apiService.post('/admin/departments', departmentData);
    return response;
  },

  updateDepartment: async (departmentId, departmentData) => {
    const response = await apiService.patch(`/admin/departments/${departmentId}`, departmentData);
    return response;
  },

  deleteDepartment: async (departmentId) => {
    const response = await apiService.delete(`/admin/departments/${departmentId}`);
    return response;
  },

  getDepartmentStatistics: async (departmentId) => {
    const response = await apiService.get(`/admin/departments/${departmentId}/statistics`);
    return response;
  },

  // Faculty Management
  getAllFaculties: async (params = {}) => {
    const response = await apiService.get('/admin/faculties', params);
    return response;
  },

  getFacultyById: async (facultyId) => {
    const response = await apiService.get(`/admin/faculties/${facultyId}`);
    return response;
  },

  createFaculty: async (facultyData) => {
    const response = await apiService.post('/admin/faculties', facultyData);
    return response;
  },

  updateFaculty: async (facultyId, facultyData) => {
    const response = await apiService.patch(`/admin/faculties/${facultyId}`, facultyData);
    return response;
  },

  deleteFaculty: async (facultyId) => {
    const response = await apiService.delete(`/admin/faculties/${facultyId}`);
    return response;
  },

  // Financial Management
  getFinancialOverview: async (params = {}) => {
    const response = await apiService.get('/admin/financial/overview', params);
    return response;
  },

  getTuitionPayments: async (params = {}) => {
    const response = await apiService.get('/admin/financial/tuition', params);
    return response;
  },

  getScholarships: async (params = {}) => {
    const response = await apiService.get('/admin/financial/scholarships', params);
    return response;
  },

  createScholarship: async (scholarshipData) => {
    const response = await apiService.post('/admin/financial/scholarships', scholarshipData);
    return response;
  },

  updateScholarship: async (scholarshipId, scholarshipData) => {
    const response = await apiService.patch(`/admin/financial/scholarships/${scholarshipId}`, scholarshipData);
    return response;
  },

  deleteScholarship: async (scholarshipId) => {
    const response = await apiService.delete(`/admin/financial/scholarships/${scholarshipId}`);
    return response;
  },

  generateFinancialReport: async (reportType, params = {}) => {
    const response = await apiService.get(`/admin/financial/reports/${reportType}`, params);
    return response;
  },

  // System Settings
  getSystemSettings: async () => {
    const response = await apiService.get('/admin/settings');
    return response;
  },

  updateSystemSettings: async (settings) => {
    const response = await apiService.patch('/admin/settings', settings);
    return response;
  },

  getEmailTemplates: async () => {
    const response = await apiService.get('/admin/settings/email-templates');
    return response;
  },

  updateEmailTemplate: async (templateId, templateData) => {
    const response = await apiService.patch(`/admin/settings/email-templates/${templateId}`, templateData);
    return response;
  },

  // Analytics and Reports
  getDashboardAnalytics: async (params = {}) => {
    const response = await apiService.get('/admin/analytics/dashboard', params);
    return response;
  },

  getEnrollmentAnalytics: async (params = {}) => {
    const response = await apiService.get('/admin/analytics/enrollment', params);
    return response;
  },

  getPerformanceAnalytics: async (params = {}) => {
    const response = await apiService.get('/admin/analytics/performance', params);
    return response;
  },

  getFinancialAnalytics: async (params = {}) => {
    const response = await apiService.get('/admin/analytics/financial', params);
    return response;
  },

  generateReport: async (reportType, params = {}, format = 'json') => {
    if (format === 'json') {
      const response = await apiService.get(`/admin/reports/${reportType}`, { ...params, format });
      return response;
    } else {
      const filename = `${reportType}_report.${format}`;
      const response = await apiService.download(`/admin/reports/${reportType}?format=${format}`, filename);
      return response;
    }
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const response = await apiService.get('/admin/audit-logs', params);
    return response;
  },

  getSystemLogs: async (params = {}) => {
    const response = await apiService.get('/admin/system-logs', params);
    return response;
  },

  // Bulk Operations
  bulkCreateUsers: async (usersData) => {
    const response = await apiService.post('/admin/users/bulk', { users: usersData });
    return response;
  },

  bulkUpdateUsers: async (updates) => {
    const response = await apiService.patch('/admin/users/bulk', { updates });
    return response;
  },

  bulkDeleteUsers: async (userIds) => {
    const response = await apiService.post('/admin/users/bulk-delete', { userIds });
    return response;
  },

  exportUsers: async (params = {}, format = 'excel') => {
    const filename = `users_export.${format}`;
    const response = await apiService.download(`/admin/users/export?format=${format}`, filename);
    return response;
  },

  importUsers: async (file, importOptions = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(importOptions));
    
    const response = await apiService.upload('/admin/users/import', formData);
    return response;
  },

  // Notifications
  sendBulkNotification: async (notificationData) => {
    const response = await apiService.post('/admin/notifications/bulk', notificationData);
    return response;
  },

  getNotificationTemplates: async () => {
    const response = await apiService.get('/admin/notifications/templates');
    return response;
  },

  createNotificationTemplate: async (templateData) => {
    const response = await apiService.post('/admin/notifications/templates', templateData);
    return response;
  },

  updateNotificationTemplate: async (templateId, templateData) => {
    const response = await apiService.patch(`/admin/notifications/templates/${templateId}`, templateData);
    return response;
  },

  deleteNotificationTemplate: async (templateId) => {
    const response = await apiService.delete(`/admin/notifications/templates/${templateId}`);
    return response;
  },

  // System Maintenance
  getSystemHealth: async () => {
    const response = await apiService.get('/admin/system/health');
    return response;
  },

  getDatabaseStatus: async () => {
    const response = await apiService.get('/admin/system/database');
    return response;
  },

  runSystemMaintenance: async (maintenanceType) => {
    const response = await apiService.post('/admin/system/maintenance', { type: maintenanceType });
    return response;
  },

  backupDatabase: async () => {
    const response = await apiService.post('/admin/system/backup');
    return response;
  },

  restoreDatabase: async (backupFile) => {
    const formData = new FormData();
    formData.append('backup', backupFile);
    
    const response = await apiService.upload('/admin/system/restore', formData);
    return response;
  },

  // Permission Management
  getRoles: async () => {
    const response = await apiService.get('/admin/roles');
    return response;
  },

  createRole: async (roleData) => {
    const response = await apiService.post('/admin/roles', roleData);
    return response;
  },

  updateRole: async (roleId, roleData) => {
    const response = await apiService.patch(`/admin/roles/${roleId}`, roleData);
    return response;
  },

  deleteRole: async (roleId) => {
    const response = await apiService.delete(`/admin/roles/${roleId}`);
    return response;
  },

  getPermissions: async () => {
    const response = await apiService.get('/admin/permissions');
    return response;
  },

  updateUserRole: async (userId, roleId) => {
    const response = await apiService.patch(`/admin/users/${userId}/role`, { roleId });
    return response;
  },

  // Integration Management
  getIntegrations: async () => {
    const response = await apiService.get('/admin/integrations');
    return response;
  },

  updateIntegration: async (integrationId, integrationData) => {
    const response = await apiService.patch(`/admin/integrations/${integrationId}`, integrationData);
    return response;
  },

  testIntegration: async (integrationId) => {
    const response = await apiService.post(`/admin/integrations/${integrationId}/test`);
    return response;
  }
};

export default adminService;