import apiService from './apiService';

export const courseService = {
  // Course Information
  getAllCourses: async (params = {}) => {
    const response = await apiService.get('/courses', params);
    return response;
  },

  getCourseById: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}`);
    return response;
  },

  searchCourses: async (query, filters = {}) => {
    const response = await apiService.get('/courses/search', {
      q: query,
      ...filters
    });
    return response;
  },

  getCoursesByDepartment: async (departmentId, params = {}) => {
    const response = await apiService.get(`/departments/${departmentId}/courses`, params);
    return response;
  },

  getCoursesByFaculty: async (facultyId, params = {}) => {
    const response = await apiService.get(`/faculties/${facultyId}/courses`, params);
    return response;
  },

  // Course Enrollment
  enrollInCourse: async (courseId) => {
    const response = await apiService.post(`/courses/${courseId}/enroll`);
    return response;
  },

  dropCourse: async (courseId) => {
    const response = await apiService.post(`/courses/${courseId}/drop`);
    return response;
  },

  getEnrollmentStatus: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/enrollment-status`);
    return response;
  },

  getWaitlist: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/waitlist`);
    return response;
  },

  joinWaitlist: async (courseId) => {
    const response = await apiService.post(`/courses/${courseId}/waitlist`);
    return response;
  },

  leaveWaitlist: async (courseId) => {
    const response = await apiService.delete(`/courses/${courseId}/waitlist`);
    return response;
  },

  // Course Materials
  getCourseMaterials: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/materials`, params);
    return response;
  },

  downloadCourseMaterial: async (courseId, materialId) => {
    const response = await apiService.get(`/courses/${courseId}/materials/${materialId}`);
    if (response.success) {
      const material = response.data;
      const filename = material.filename || `material_${materialId}`;
      return await apiService.download(`/courses/${courseId}/materials/${materialId}/download`, filename);
    }
    return response;
  },

  // Course Schedule
  getCourseSchedule: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/schedule`);
    return response;
  },

  getCourseSessions: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/sessions`, params);
    return response;
  },

  // Assignments
  getCourseAssignments: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/assignments`, params);
    return response;
  },

  getAssignmentById: async (courseId, assignmentId) => {
    const response = await apiService.get(`/courses/${courseId}/assignments/${assignmentId}`);
    return response;
  },

  submitAssignment: async (courseId, assignmentId, submissionData) => {
    const formData = new FormData();
    
    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }
    
    if (submissionData.files) {
      submissionData.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    }
    
    if (submissionData.notes) {
      formData.append('notes', submissionData.notes);
    }
    
    const response = await apiService.upload(`/courses/${courseId}/assignments/${assignmentId}/submit`, formData);
    return response;
  },

  getMySubmission: async (courseId, assignmentId) => {
    const response = await apiService.get(`/courses/${courseId}/assignments/${assignmentId}/my-submission`);
    return response;
  },

  // Grades
  getCourseGrades: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/grades`, params);
    return response;
  },

  getGradeBreakdown: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/grade-breakdown`);
    return response;
  },

  // Attendance
  getCourseAttendance: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/attendance`, params);
    return response;
  },

  markAttendance: async (courseId, sessionId, attendanceData) => {
    const response = await apiService.post(`/courses/${courseId}/sessions/${sessionId}/attendance`, attendanceData);
    return response;
  },

  // Course Communication
  getCourseAnnouncements: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/announcements`, params);
    return response;
  },

  getCourseForum: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/forum`, params);
    return response;
  },

  createForumPost: async (courseId, postData) => {
    const response = await apiService.post(`/courses/${courseId}/forum`, postData);
    return response;
  },

  replyToForumPost: async (courseId, postId, replyData) => {
    const response = await apiService.post(`/courses/${courseId}/forum/${postId}/replies`, replyData);
    return response;
  },

  // Course Evaluation
  getCourseEvaluation: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/evaluation`);
    return response;
  },

  submitCourseEvaluation: async (courseId, evaluationData) => {
    const response = await apiService.post(`/courses/${courseId}/evaluation`, evaluationData);
    return response;
  },

  // Prerequisites and Requirements
  getPrerequisites: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/prerequisites`);
    return response;
  },

  checkPrerequisites: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/check-prerequisites`);
    return response;
  },

  // Course Catalog
  getCourseCatalog: async (params = {}) => {
    const response = await apiService.get('/courses/catalog', params);
    return response;
  },

  getCourseHistory: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/history`);
    return response;
  },

  // Virtual Classes
  joinVirtualClass: async (courseId, sessionId) => {
    const response = await apiService.post(`/courses/${courseId}/sessions/${sessionId}/join`);
    return response;
  },

  getVirtualClassLink: async (courseId, sessionId) => {
    const response = await apiService.get(`/courses/${courseId}/sessions/${sessionId}/virtual-link`);
    return response;
  },

  recordAttendanceForVirtualClass: async (courseId, sessionId) => {
    const response = await apiService.post(`/courses/${courseId}/sessions/${sessionId}/virtual-attendance`);
    return response;
  },

  // Course Statistics
  getCourseStatistics: async (courseId) => {
    const response = await apiService.get(`/courses/${courseId}/statistics`);
    return response;
  },

  getCourseAnalytics: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/analytics`, params);
    return response;
  },

  // Export Functions
  exportCourseData: async (courseId, format = 'excel') => {
    const filename = `course_${courseId}_data.${format}`;
    const response = await apiService.download(`/courses/${courseId}/export?format=${format}`, filename);
    return response;
  },

  exportGrades: async (courseId, format = 'excel') => {
    const filename = `course_${courseId}_grades.${format}`;
    const response = await apiService.download(`/courses/${courseId}/grades/export?format=${format}`, filename);
    return response;
  },

  exportAttendance: async (courseId, format = 'excel') => {
    const filename = `course_${courseId}_attendance.${format}`;
    const response = await apiService.download(`/courses/${courseId}/attendance/export?format=${format}`, filename);
    return response;
  }
};

export default courseService;