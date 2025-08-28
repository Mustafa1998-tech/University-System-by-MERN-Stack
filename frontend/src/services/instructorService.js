import apiService from './apiService';

export const instructorService = {
  // Instructor Profile Management
  getProfile: async (instructorId) => {
    const url = instructorId ? `/instructors/${instructorId}` : '/instructors/profile';
    const response = await apiService.get(url);
    return response;
  },

  updateProfile: async (instructorId, profileData) => {
    const url = instructorId ? `/instructors/${instructorId}` : '/instructors/profile';
    const response = await apiService.patch(url, profileData);
    return response;
  },

  // Course Management
  getCourses: async (instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses` 
      : '/instructors/courses';
    
    const response = await apiService.get(url, params);
    return response;
  },

  createCourse: async (courseData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses` 
      : '/instructors/courses';
    
    const response = await apiService.post(url, courseData);
    return response;
  },

  updateCourse: async (courseId, courseData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}` 
      : `/instructors/courses/${courseId}`;
    
    const response = await apiService.patch(url, courseData);
    return response;
  },

  deleteCourse: async (courseId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}` 
      : `/instructors/courses/${courseId}`;
    
    const response = await apiService.delete(url);
    return response;
  },

  getCourseDetails: async (courseId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}` 
      : `/instructors/courses/${courseId}`;
    
    const response = await apiService.get(url);
    return response;
  },

  // Student Management
  getCourseStudents: async (courseId, instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/students` 
      : `/instructors/courses/${courseId}/students`;
    
    const response = await apiService.get(url, params);
    return response;
  },

  addStudentToCourse: async (courseId, studentId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/students` 
      : `/instructors/courses/${courseId}/students`;
    
    const response = await apiService.post(url, { studentId });
    return response;
  },

  removeStudentFromCourse: async (courseId, studentId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/students/${studentId}` 
      : `/instructors/courses/${courseId}/students/${studentId}`;
    
    const response = await apiService.delete(url);
    return response;
  },

  getStudentProgress: async (courseId, studentId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/students/${studentId}/progress` 
      : `/instructors/courses/${courseId}/students/${studentId}/progress`;
    
    const response = await apiService.get(url);
    return response;
  },

  // Assignment Management
  getAssignments: async (courseId, instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/assignments` 
      : `/instructors/courses/${courseId}/assignments`;
    
    const response = await apiService.get(url, params);
    return response;
  },

  createAssignment: async (courseId, assignmentData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/assignments` 
      : `/instructors/courses/${courseId}/assignments`;
    
    const response = await apiService.post(url, assignmentData);
    return response;
  },

  updateAssignment: async (courseId, assignmentId, assignmentData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/assignments/${assignmentId}` 
      : `/instructors/courses/${courseId}/assignments/${assignmentId}`;
    
    const response = await apiService.patch(url, assignmentData);
    return response;
  },

  deleteAssignment: async (courseId, assignmentId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/assignments/${assignmentId}` 
      : `/instructors/courses/${courseId}/assignments/${assignmentId}`;
    
    const response = await apiService.delete(url);
    return response;
  },

  getAssignmentSubmissions: async (courseId, assignmentId, instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/assignments/${assignmentId}/submissions` 
      : `/instructors/courses/${courseId}/assignments/${assignmentId}/submissions`;
    
    const response = await apiService.get(url, params);
    return response;
  },

  // Grading and Evaluation
  gradeSubmission: async (courseId, assignmentId, submissionId, gradeData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade` 
      : `/instructors/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`;
    
    const response = await apiService.post(url, gradeData);
    return response;
  },

  updateGrade: async (courseId, assignmentId, submissionId, gradeData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade` 
      : `/instructors/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`;
    
    const response = await apiService.patch(url, gradeData);
    return response;
  },

  getCourseGrades: async (courseId, instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/grades` 
      : `/instructors/courses/${courseId}/grades`;
    
    const response = await apiService.get(url, params);
    return response;
  },

  exportGrades: async (courseId, instructorId, format = 'excel') => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/grades/export` 
      : `/instructors/courses/${courseId}/grades/export`;
    
    const filename = `grades_${courseId}.${format}`;
    const response = await apiService.download(`${url}?format=${format}`, filename);
    return response;
  },

  bulkUpdateGrades: async (courseId, gradesData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/grades/bulk` 
      : `/instructors/courses/${courseId}/grades/bulk`;
    
    const response = await apiService.patch(url, { grades: gradesData });
    return response;
  },

  // Attendance Management
  getCourseAttendance: async (courseId, instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/attendance` 
      : `/instructors/courses/${courseId}/attendance`;
    
    const response = await apiService.get(url, params);
    return response;
  },

  takeAttendance: async (courseId, attendanceData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/attendance` 
      : `/instructors/courses/${courseId}/attendance`;
    
    const response = await apiService.post(url, attendanceData);
    return response;
  },

  updateAttendance: async (courseId, attendanceId, attendanceData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/attendance/${attendanceId}` 
      : `/instructors/courses/${courseId}/attendance/${attendanceId}`;
    
    const response = await apiService.patch(url, attendanceData);
    return response;
  },

  getStudentAttendance: async (courseId, studentId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/students/${studentId}/attendance` 
      : `/instructors/courses/${courseId}/students/${studentId}/attendance`;
    
    const response = await apiService.get(url);
    return response;
  },

  // Course Materials
  getCourseMaterials: async (courseId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/materials` 
      : `/instructors/courses/${courseId}/materials`;
    
    const response = await apiService.get(url);
    return response;
  },

  uploadCourseMaterial: async (courseId, materialData, instructorId) => {
    const formData = new FormData();
    
    // Add file
    if (materialData.file) {
      formData.append('file', materialData.file);
    }
    
    // Add metadata
    formData.append('title', materialData.title);
    formData.append('description', materialData.description || '');
    formData.append('type', materialData.type);
    formData.append('category', materialData.category || 'general');
    
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/materials` 
      : `/instructors/courses/${courseId}/materials`;
    
    const response = await apiService.upload(url, formData);
    return response;
  },

  updateCourseMaterial: async (courseId, materialId, materialData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/materials/${materialId}` 
      : `/instructors/courses/${courseId}/materials/${materialId}`;
    
    const response = await apiService.patch(url, materialData);
    return response;
  },

  deleteCourseMaterial: async (courseId, materialId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/materials/${materialId}` 
      : `/instructors/courses/${courseId}/materials/${materialId}`;
    
    const response = await apiService.delete(url);
    return response;
  },

  // Schedule Management
  getSchedule: async (instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/schedule` 
      : '/instructors/schedule';
    
    const response = await apiService.get(url, params);
    return response;
  },

  updateSchedule: async (scheduleData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/schedule` 
      : '/instructors/schedule';
    
    const response = await apiService.patch(url, scheduleData);
    return response;
  },

  // Communication
  sendNotificationToStudents: async (courseId, notificationData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/notifications` 
      : `/instructors/courses/${courseId}/notifications`;
    
    const response = await apiService.post(url, notificationData);
    return response;
  },

  sendMessageToStudent: async (studentId, messageData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/messages` 
      : '/instructors/messages';
    
    const response = await apiService.post(url, {
      ...messageData,
      recipientId: studentId
    });
    return response;
  },

  getMessages: async (instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/messages` 
      : '/instructors/messages';
    
    const response = await apiService.get(url, params);
    return response;
  },

  // Analytics and Reports
  getCourseAnalytics: async (courseId, instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/analytics` 
      : `/instructors/courses/${courseId}/analytics`;
    
    const response = await apiService.get(url, params);
    return response;
  },

  getStudentPerformanceReport: async (courseId, instructorId, format = 'json') => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/reports/performance` 
      : `/instructors/courses/${courseId}/reports/performance`;
    
    if (format === 'json') {
      const response = await apiService.get(url, { format });
      return response;
    } else {
      const filename = `performance_report_${courseId}.${format}`;
      const response = await apiService.download(`${url}?format=${format}`, filename);
      return response;
    }
  },

  getAttendanceReport: async (courseId, instructorId, format = 'json') => {
    const url = instructorId 
      ? `/instructors/${instructorId}/courses/${courseId}/reports/attendance` 
      : `/instructors/courses/${courseId}/reports/attendance`;
    
    if (format === 'json') {
      const response = await apiService.get(url, { format });
      return response;
    } else {
      const filename = `attendance_report_${courseId}.${format}`;
      const response = await apiService.download(`${url}?format=${format}`, filename);
      return response;
    }
  },

  // Dashboard Data
  getDashboardData: async (instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/dashboard` 
      : '/instructors/dashboard';
    
    const response = await apiService.get(url);
    return response;
  },

  // Research and Publications
  getResearchProjects: async (instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/research` 
      : '/instructors/research';
    
    const response = await apiService.get(url, params);
    return response;
  },

  createResearchProject: async (projectData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/research` 
      : '/instructors/research';
    
    const response = await apiService.post(url, projectData);
    return response;
  },

  updateResearchProject: async (projectId, projectData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/research/${projectId}` 
      : `/instructors/research/${projectId}`;
    
    const response = await apiService.patch(url, projectData);
    return response;
  },

  getPublications: async (instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/publications` 
      : '/instructors/publications';
    
    const response = await apiService.get(url, params);
    return response;
  },

  addPublication: async (publicationData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/publications` 
      : '/instructors/publications';
    
    const response = await apiService.post(url, publicationData);
    return response;
  },

  // Office Hours
  getOfficeHours: async (instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/office-hours` 
      : '/instructors/office-hours';
    
    const response = await apiService.get(url);
    return response;
  },

  updateOfficeHours: async (officeHoursData, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/office-hours` 
      : '/instructors/office-hours';
    
    const response = await apiService.patch(url, officeHoursData);
    return response;
  },

  getOfficeHourAppointments: async (instructorId, params = {}) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/office-hours/appointments` 
      : '/instructors/office-hours/appointments';
    
    const response = await apiService.get(url, params);
    return response;
  },

  approveAppointment: async (appointmentId, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/office-hours/appointments/${appointmentId}/approve` 
      : `/instructors/office-hours/appointments/${appointmentId}/approve`;
    
    const response = await apiService.patch(url);
    return response;
  },

  rejectAppointment: async (appointmentId, reason, instructorId) => {
    const url = instructorId 
      ? `/instructors/${instructorId}/office-hours/appointments/${appointmentId}/reject` 
      : `/instructors/office-hours/appointments/${appointmentId}/reject`;
    
    const response = await apiService.patch(url, { reason });
    return response;
  }
};

export default instructorService;