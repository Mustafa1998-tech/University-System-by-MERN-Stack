import apiService from './apiService';

export const studentService = {
  // Student Profile Management
  getProfile: async (studentId) => {
    const url = studentId ? `/students/${studentId}` : '/students/profile';
    const response = await apiService.get(url);
    return response;
  },

  updateProfile: async (studentId, profileData) => {
    const url = studentId ? `/students/${studentId}` : '/students/profile';
    const response = await apiService.patch(url, profileData);
    return response;
  },

  uploadDocument: async (studentId, documentType, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    
    const url = studentId 
      ? `/students/${studentId}/documents` 
      : '/students/documents';
    
    const response = await apiService.upload(url, formData);
    return response;
  },

  getDocuments: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/documents` 
      : '/students/documents';
    
    const response = await apiService.get(url);
    return response;
  },

  deleteDocument: async (studentId, documentId) => {
    const url = studentId 
      ? `/students/${studentId}/documents/${documentId}` 
      : `/students/documents/${documentId}`;
    
    const response = await apiService.delete(url);
    return response;
  },

  // Course Management
  getCourses: async (studentId, params = {}) => {
    const url = studentId 
      ? `/students/${studentId}/courses` 
      : '/students/courses';
    
    const response = await apiService.get(url, params);
    return response;
  },

  enrollInCourse: async (courseId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/courses/${courseId}/enroll` 
      : `/students/courses/${courseId}/enroll`;
    
    const response = await apiService.post(url);
    return response;
  },

  dropCourse: async (courseId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/courses/${courseId}/drop` 
      : `/students/courses/${courseId}/drop`;
    
    const response = await apiService.post(url);
    return response;
  },

  getCourseDetails: async (courseId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/courses/${courseId}` 
      : `/students/courses/${courseId}`;
    
    const response = await apiService.get(url);
    return response;
  },

  // Schedule Management
  getSchedule: async (studentId, params = {}) => {
    const url = studentId 
      ? `/students/${studentId}/schedule` 
      : '/students/schedule';
    
    const response = await apiService.get(url, params);
    return response;
  },

  // Grades and Assessments
  getGrades: async (studentId, params = {}) => {
    const url = studentId 
      ? `/students/${studentId}/grades` 
      : '/students/grades';
    
    const response = await apiService.get(url, params);
    return response;
  },

  getCourseGrades: async (courseId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/courses/${courseId}/grades` 
      : `/students/courses/${courseId}/grades`;
    
    const response = await apiService.get(url);
    return response;
  },

  getTranscript: async (studentId, format = 'json') => {
    const url = studentId 
      ? `/students/${studentId}/transcript` 
      : '/students/transcript';
    
    const response = await apiService.get(url, { format });
    return response;
  },

  downloadTranscript: async (studentId, format = 'pdf') => {
    const url = studentId 
      ? `/students/${studentId}/transcript` 
      : '/students/transcript';
    
    const filename = `transcript_${studentId || 'current'}.${format}`;
    const response = await apiService.download(`${url}?format=${format}`, filename);
    return response;
  },

  // Assignments and Submissions
  getAssignments: async (studentId, params = {}) => {
    const url = studentId 
      ? `/students/${studentId}/assignments` 
      : '/students/assignments';
    
    const response = await apiService.get(url, params);
    return response;
  },

  getAssignmentDetails: async (assignmentId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/assignments/${assignmentId}` 
      : `/students/assignments/${assignmentId}`;
    
    const response = await apiService.get(url);
    return response;
  },

  submitAssignment: async (assignmentId, submissionData, studentId) => {
    const formData = new FormData();
    
    // Add text content
    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }
    
    // Add files
    if (submissionData.files) {
      submissionData.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    }
    
    // Add submission notes
    if (submissionData.notes) {
      formData.append('notes', submissionData.notes);
    }
    
    const url = studentId 
      ? `/students/${studentId}/assignments/${assignmentId}/submit` 
      : `/students/assignments/${assignmentId}/submit`;
    
    const response = await apiService.upload(url, formData);
    return response;
  },

  // Attendance
  getAttendance: async (studentId, params = {}) => {
    const url = studentId 
      ? `/students/${studentId}/attendance` 
      : '/students/attendance';
    
    const response = await apiService.get(url, params);
    return response;
  },

  getCourseAttendance: async (courseId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/courses/${courseId}/attendance` 
      : `/students/courses/${courseId}/attendance`;
    
    const response = await apiService.get(url);
    return response;
  },

  // Financial Information
  getFinancialInfo: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/financial` 
      : '/students/financial';
    
    const response = await apiService.get(url);
    return response;
  },

  getPaymentHistory: async (studentId, params = {}) => {
    const url = studentId 
      ? `/students/${studentId}/payments` 
      : '/students/payments';
    
    const response = await apiService.get(url, params);
    return response;
  },

  makePayment: async (paymentData, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/payments` 
      : '/students/payments';
    
    const response = await apiService.post(url, paymentData);
    return response;
  },

  downloadInvoice: async (paymentId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/payments/${paymentId}/invoice` 
      : `/students/payments/${paymentId}/invoice`;
    
    const filename = `invoice_${paymentId}.pdf`;
    const response = await apiService.download(url, filename);
    return response;
  },

  // Certificates and Documents
  requestCertificate: async (certificateType, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/certificates` 
      : '/students/certificates';
    
    const response = await apiService.post(url, { type: certificateType });
    return response;
  },

  getCertificates: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/certificates` 
      : '/students/certificates';
    
    const response = await apiService.get(url);
    return response;
  },

  downloadCertificate: async (certificateId, studentId, format = 'pdf') => {
    const url = studentId 
      ? `/students/${studentId}/certificates/${certificateId}` 
      : `/students/certificates/${certificateId}`;
    
    const filename = `certificate_${certificateId}.${format}`;
    const response = await apiService.download(`${url}?format=${format}`, filename);
    return response;
  },

  // Library Services
  getLibraryAccount: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/library` 
      : '/students/library';
    
    const response = await apiService.get(url);
    return response;
  },

  getBorrowedBooks: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/library/borrowed` 
      : '/students/library/borrowed';
    
    const response = await apiService.get(url);
    return response;
  },

  renewBook: async (bookId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/library/books/${bookId}/renew` 
      : `/students/library/books/${bookId}/renew`;
    
    const response = await apiService.post(url);
    return response;
  },

  // Notifications
  getNotifications: async (studentId, params = {}) => {
    const url = studentId 
      ? `/students/${studentId}/notifications` 
      : '/students/notifications';
    
    const response = await apiService.get(url, params);
    return response;
  },

  markNotificationAsRead: async (notificationId, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/notifications/${notificationId}/read` 
      : `/students/notifications/${notificationId}/read`;
    
    const response = await apiService.patch(url);
    return response;
  },

  markAllNotificationsAsRead: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/notifications/read-all` 
      : '/students/notifications/read-all';
    
    const response = await apiService.patch(url);
    return response;
  },

  // Dashboard Data
  getDashboardData: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/dashboard` 
      : '/students/dashboard';
    
    const response = await apiService.get(url);
    return response;
  },

  // Academic Advisor
  getAdvisor: async (studentId) => {
    const url = studentId 
      ? `/students/${studentId}/advisor` 
      : '/students/advisor';
    
    const response = await apiService.get(url);
    return response;
  },

  scheduleAdvisorMeeting: async (meetingData, studentId) => {
    const url = studentId 
      ? `/students/${studentId}/advisor/meetings` 
      : '/students/advisor/meetings';
    
    const response = await apiService.post(url, meetingData);
    return response;
  },

  // Search and Filters
  searchStudents: async (query, filters = {}) => {
    const response = await apiService.get('/students/search', {
      q: query,
      ...filters
    });
    return response;
  },

  getStudentsByDepartment: async (departmentId, params = {}) => {
    const response = await apiService.get(`/departments/${departmentId}/students`, params);
    return response;
  },

  getStudentsByCourse: async (courseId, params = {}) => {
    const response = await apiService.get(`/courses/${courseId}/students`, params);
    return response;
  }
};

export default studentService;