import apiService from './apiService';

export const libraryService = {
  // Book Management
  searchBooks: async (query, filters = {}) => {
    const response = await apiService.get('/library/books/search', {
      q: query,
      ...filters
    });
    return response;
  },

  getAllBooks: async (params = {}) => {
    const response = await apiService.get('/library/books', params);
    return response;
  },

  getBookById: async (bookId) => {
    const response = await apiService.get(`/library/books/${bookId}`);
    return response;
  },

  getBooksByCategory: async (categoryId, params = {}) => {
    const response = await apiService.get(`/library/categories/${categoryId}/books`, params);
    return response;
  },

  getBooksByAuthor: async (authorId, params = {}) => {
    const response = await apiService.get(`/library/authors/${authorId}/books`, params);
    return response;
  },

  // Book Borrowing
  borrowBook: async (bookId) => {
    const response = await apiService.post(`/library/books/${bookId}/borrow`);
    return response;
  },

  returnBook: async (bookId) => {
    const response = await apiService.post(`/library/books/${bookId}/return`);
    return response;
  },

  renewBook: async (bookId) => {
    const response = await apiService.post(`/library/books/${bookId}/renew`);
    return response;
  },

  reserveBook: async (bookId) => {
    const response = await apiService.post(`/library/books/${bookId}/reserve`);
    return response;
  },

  cancelReservation: async (bookId) => {
    const response = await apiService.delete(`/library/books/${bookId}/reserve`);
    return response;
  },

  // User Library Account
  getMyAccount: async () => {
    const response = await apiService.get('/library/my-account');
    return response;
  },

  getBorrowedBooks: async () => {
    const response = await apiService.get('/library/my-account/borrowed');
    return response;
  },

  getReservedBooks: async () => {
    const response = await apiService.get('/library/my-account/reserved');
    return response;
  },

  getBorrowHistory: async (params = {}) => {
    const response = await apiService.get('/library/my-account/history', params);
    return response;
  },

  getFines: async () => {
    const response = await apiService.get('/library/my-account/fines');
    return response;
  },

  payFine: async (fineId, paymentData) => {
    const response = await apiService.post(`/library/fines/${fineId}/pay`, paymentData);
    return response;
  },

  // Categories and Classifications
  getCategories: async () => {
    const response = await apiService.get('/library/categories');
    return response;
  },

  getAuthors: async (params = {}) => {
    const response = await apiService.get('/library/authors', params);
    return response;
  },

  getPublishers: async (params = {}) => {
    const response = await apiService.get('/library/publishers', params);
    return response;
  },

  // Digital Resources
  getDigitalBooks: async (params = {}) => {
    const response = await apiService.get('/library/digital-books', params);
    return response;
  },

  downloadDigitalBook: async (bookId) => {
    const response = await apiService.get(`/library/digital-books/${bookId}`);
    if (response.success) {
      const book = response.data;
      const filename = book.filename || `book_${bookId}.pdf`;
      return await apiService.download(`/library/digital-books/${bookId}/download`, filename);
    }
    return response;
  },

  getJournals: async (params = {}) => {
    const response = await apiService.get('/library/journals', params);
    return response;
  },

  getJournalArticles: async (journalId, params = {}) => {
    const response = await apiService.get(`/library/journals/${journalId}/articles`, params);
    return response;
  },

  // Research Services
  getResearchDatabases: async () => {
    const response = await apiService.get('/library/research/databases');
    return response;
  },

  searchDatabase: async (databaseId, query, filters = {}) => {
    const response = await apiService.get(`/library/research/databases/${databaseId}/search`, {
      q: query,
      ...filters
    });
    return response;
  },

  requestInterlibrary: async (requestData) => {
    const response = await apiService.post('/library/interlibrary-loan', requestData);
    return response;
  },

  getInterlibraryRequests: async () => {
    const response = await apiService.get('/library/interlibrary-loan');
    return response;
  },

  // Library Events and Services
  getLibraryEvents: async (params = {}) => {
    const response = await apiService.get('/library/events', params);
    return response;
  },

  registerForEvent: async (eventId) => {
    const response = await apiService.post(`/library/events/${eventId}/register`);
    return response;
  },

  unregisterFromEvent: async (eventId) => {
    const response = await apiService.delete(`/library/events/${eventId}/register`);
    return response;
  },

  // Study Rooms and Spaces
  getStudyRooms: async (params = {}) => {
    const response = await apiService.get('/library/study-rooms', params);
    return response;
  },

  bookStudyRoom: async (roomId, bookingData) => {
    const response = await apiService.post(`/library/study-rooms/${roomId}/book`, bookingData);
    return response;
  },

  getMyRoomBookings: async () => {
    const response = await apiService.get('/library/study-rooms/my-bookings');
    return response;
  },

  cancelRoomBooking: async (bookingId) => {
    const response = await apiService.delete(`/library/study-rooms/bookings/${bookingId}`);
    return response;
  },

  // Equipment and Resources
  getEquipment: async (params = {}) => {
    const response = await apiService.get('/library/equipment', params);
    return response;
  },

  borrowEquipment: async (equipmentId, borrowData) => {
    const response = await apiService.post(`/library/equipment/${equipmentId}/borrow`, borrowData);
    return response;
  },

  returnEquipment: async (equipmentId) => {
    const response = await apiService.post(`/library/equipment/${equipmentId}/return`);
    return response;
  },

  // Notifications and Alerts
  getLibraryNotifications: async () => {
    const response = await apiService.get('/library/notifications');
    return response;
  },

  updateNotificationSettings: async (settings) => {
    const response = await apiService.patch('/library/notifications/settings', settings);
    return response;
  },

  // Statistics and Reports
  getLibraryStatistics: async () => {
    const response = await apiService.get('/library/statistics');
    return response;
  },

  getUserStatistics: async () => {
    const response = await apiService.get('/library/my-account/statistics');
    return response;
  },

  // Admin Functions (for librarians and admins)
  addBook: async (bookData) => {
    const response = await apiService.post('/library/admin/books', bookData);
    return response;
  },

  updateBook: async (bookId, bookData) => {
    const response = await apiService.patch(`/library/admin/books/${bookId}`, bookData);
    return response;
  },

  deleteBook: async (bookId) => {
    const response = await apiService.delete(`/library/admin/books/${bookId}`);
    return response;
  },

  getAllBorrowedBooks: async (params = {}) => {
    const response = await apiService.get('/library/admin/borrowed', params);
    return response;
  },

  getAllOverdueBooks: async (params = {}) => {
    const response = await apiService.get('/library/admin/overdue', params);
    return response;
  },

  sendOverdueNotices: async (userIds) => {
    const response = await apiService.post('/library/admin/overdue-notices', { userIds });
    return response;
  },

  generateLibraryReport: async (reportType, params = {}) => {
    const response = await apiService.get(`/library/admin/reports/${reportType}`, params);
    return response;
  },

  exportLibraryData: async (dataType, format = 'excel') => {
    const filename = `library_${dataType}.${format}`;
    const response = await apiService.download(`/library/admin/export/${dataType}?format=${format}`, filename);
    return response;
  }
};

export default libraryService;