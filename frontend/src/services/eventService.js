import apiService from './apiService';

export const eventService = {
  // Event Management
  getAllEvents: async (params = {}) => {
    const response = await apiService.get('/events', params);
    return response;
  },

  getEventById: async (eventId) => {
    const response = await apiService.get(`/events/${eventId}`);
    return response;
  },

  searchEvents: async (query, filters = {}) => {
    const response = await apiService.get('/events/search', {
      q: query,
      ...filters
    });
    return response;
  },

  getEventsByCategory: async (categoryId, params = {}) => {
    const response = await apiService.get(`/events/categories/${categoryId}`, params);
    return response;
  },

  getEventsByDate: async (date, params = {}) => {
    const response = await apiService.get('/events/by-date', {
      date: date.toISOString().split('T')[0],
      ...params
    });
    return response;
  },

  getUpcomingEvents: async (params = {}) => {
    const response = await apiService.get('/events/upcoming', params);
    return response;
  },

  getFeaturedEvents: async (params = {}) => {
    const response = await apiService.get('/events/featured', params);
    return response;
  },

  // Event Registration
  registerForEvent: async (eventId, registrationData = {}) => {
    const response = await apiService.post(`/events/${eventId}/register`, registrationData);
    return response;
  },

  unregisterFromEvent: async (eventId) => {
    const response = await apiService.delete(`/events/${eventId}/register`);
    return response;
  },

  getRegistrationStatus: async (eventId) => {
    const response = await apiService.get(`/events/${eventId}/registration-status`);
    return response;
  },

  getMyRegistrations: async (params = {}) => {
    const response = await apiService.get('/events/my-registrations', params);
    return response;
  },

  // Event Attendance
  checkIn: async (eventId) => {
    const response = await apiService.post(`/events/${eventId}/check-in`);
    return response;
  },

  checkOut: async (eventId) => {
    const response = await apiService.post(`/events/${eventId}/check-out`);
    return response;
  },

  getAttendanceHistory: async (params = {}) => {
    const response = await apiService.get('/events/my-attendance', params);
    return response;
  },

  // Event Categories
  getCategories: async () => {
    const response = await apiService.get('/events/categories');
    return response;
  },

  // Event Feedback and Rating
  submitEventFeedback: async (eventId, feedbackData) => {
    const response = await apiService.post(`/events/${eventId}/feedback`, feedbackData);
    return response;
  },

  rateEvent: async (eventId, rating) => {
    const response = await apiService.post(`/events/${eventId}/rate`, { rating });
    return response;
  },

  getEventFeedback: async (eventId, params = {}) => {
    const response = await apiService.get(`/events/${eventId}/feedback`, params);
    return response;
  },

  // Announcements
  getAllAnnouncements: async (params = {}) => {
    const response = await apiService.get('/announcements', params);
    return response;
  },

  getAnnouncementById: async (announcementId) => {
    const response = await apiService.get(`/announcements/${announcementId}`);
    return response;
  },

  getAnnouncementsByDepartment: async (departmentId, params = {}) => {
    const response = await apiService.get(`/announcements/department/${departmentId}`, params);
    return response;
  },

  getAnnouncementsByFaculty: async (facultyId, params = {}) => {
    const response = await apiService.get(`/announcements/faculty/${facultyId}`, params);
    return response;
  },

  markAnnouncementAsRead: async (announcementId) => {
    const response = await apiService.patch(`/announcements/${announcementId}/read`);
    return response;
  },

  // News and Updates
  getNews: async (params = {}) => {
    const response = await apiService.get('/news', params);
    return response;
  },

  getNewsById: async (newsId) => {
    const response = await apiService.get(`/news/${newsId}`);
    return response;
  },

  getLatestNews: async (limit = 10) => {
    const response = await apiService.get('/news/latest', { limit });
    return response;
  },

  // Club and Organization Events
  getClubEvents: async (clubId, params = {}) => {
    const response = await apiService.get(`/clubs/${clubId}/events`, params);
    return response;
  },

  getAllClubs: async (params = {}) => {
    const response = await apiService.get('/clubs', params);
    return response;
  },

  joinClub: async (clubId) => {
    const response = await apiService.post(`/clubs/${clubId}/join`);
    return response;
  },

  leaveClub: async (clubId) => {
    const response = await apiService.delete(`/clubs/${clubId}/join`);
    return response;
  },

  getMyClubs: async () => {
    const response = await apiService.get('/clubs/my-clubs');
    return response;
  },

  // Sports and Recreation
  getSportsEvents: async (params = {}) => {
    const response = await apiService.get('/sports/events', params);
    return response;
  },

  registerForSportsEvent: async (eventId, registrationData = {}) => {
    const response = await apiService.post(`/sports/events/${eventId}/register`, registrationData);
    return response;
  },

  getSportsTeams: async (params = {}) => {
    const response = await apiService.get('/sports/teams', params);
    return response;
  },

  joinSportsTeam: async (teamId, applicationData = {}) => {
    const response = await apiService.post(`/sports/teams/${teamId}/join`, applicationData);
    return response;
  },

  // Cultural Events
  getCulturalEvents: async (params = {}) => {
    const response = await apiService.get('/cultural/events', params);
    return response;
  },

  // Academic Events
  getAcademicEvents: async (params = {}) => {
    const response = await apiService.get('/academic/events', params);
    return response;
  },

  getConferences: async (params = {}) => {
    const response = await apiService.get('/academic/conferences', params);
    return response;
  },

  getWorkshops: async (params = {}) => {
    const response = await apiService.get('/academic/workshops', params);
    return response;
  },

  getSeminars: async (params = {}) => {
    const response = await apiService.get('/academic/seminars', params);
    return response;
  },

  // Event Calendar
  getCalendar: async (month, year) => {
    const response = await apiService.get('/events/calendar', { month, year });
    return response;
  },

  getMyCalendar: async (month, year) => {
    const response = await apiService.get('/events/my-calendar', { month, year });
    return response;
  },

  exportCalendar: async (format = 'ics') => {
    const filename = `events_calendar.${format}`;
    const response = await apiService.download(`/events/calendar/export?format=${format}`, filename);
    return response;
  },

  // Notifications and Reminders
  getEventNotifications: async () => {
    const response = await apiService.get('/events/notifications');
    return response;
  },

  updateNotificationSettings: async (settings) => {
    const response = await apiService.patch('/events/notifications/settings', settings);
    return response;
  },

  setEventReminder: async (eventId, reminderData) => {
    const response = await apiService.post(`/events/${eventId}/reminder`, reminderData);
    return response;
  },

  removeEventReminder: async (eventId) => {
    const response = await apiService.delete(`/events/${eventId}/reminder`);
    return response;
  },

  // Admin Functions (for event organizers and admins)
  createEvent: async (eventData) => {
    const formData = new FormData();
    
    // Add basic event data
    Object.keys(eventData).forEach(key => {
      if (key !== 'image' && key !== 'attachments') {
        formData.append(key, eventData[key]);
      }
    });
    
    // Add image if provided
    if (eventData.image) {
      formData.append('image', eventData.image);
    }
    
    // Add attachments if provided
    if (eventData.attachments) {
      eventData.attachments.forEach((file, index) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await apiService.upload('/events', formData);
    return response;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await apiService.patch(`/events/${eventId}`, eventData);
    return response;
  },

  deleteEvent: async (eventId) => {
    const response = await apiService.delete(`/events/${eventId}`);
    return response;
  },

  getEventRegistrations: async (eventId, params = {}) => {
    const response = await apiService.get(`/events/${eventId}/registrations`, params);
    return response;
  },

  getEventAttendance: async (eventId, params = {}) => {
    const response = await apiService.get(`/events/${eventId}/attendance`, params);
    return response;
  },

  exportEventData: async (eventId, format = 'excel') => {
    const filename = `event_${eventId}_data.${format}`;
    const response = await apiService.download(`/events/${eventId}/export?format=${format}`, filename);
    return response;
  },

  sendEventNotification: async (eventId, notificationData) => {
    const response = await apiService.post(`/events/${eventId}/notify`, notificationData);
    return response;
  },

  // Analytics and Reports
  getEventAnalytics: async (eventId) => {
    const response = await apiService.get(`/events/${eventId}/analytics`);
    return response;
  },

  getEventsReport: async (params = {}) => {
    const response = await apiService.get('/events/reports', params);
    return response;
  },

  getPopularEvents: async (params = {}) => {
    const response = await apiService.get('/events/popular', params);
    return response;
  }
};

export default eventService;