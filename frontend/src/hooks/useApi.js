import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authService, studentService, instructorService, adminService, courseService } from '../services';

// Generic API hook for any service method
export const useApi = (apiCall, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(...args);
      if (response.success) {
        setData(response.data);
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { data, loading, error, execute };
};

// Authentication hooks
export const useAuth = () => {
  const queryClient = useQueryClient();
  
  const loginMutation = useMutation(authService.login, {
    onSuccess: (data) => {
      queryClient.setQueryData('user', data.user);
    }
  });

  const logoutMutation = useMutation(authService.logout, {
    onSuccess: () => {
      queryClient.clear();
    }
  });

  const registerMutation = useMutation(authService.register);

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError
  } = useQuery('user', authService.getCurrentUser, {
    staleTime: Infinity,
    cacheTime: Infinity,
    initialData: authService.getCurrentUser()
  });

  return {
    user,
    isLoadingUser,
    userError,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isLoading,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isLoading,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isLoading,
    registerError: registerMutation.error,
    isAuthenticated: authService.isAuthenticated(),
    hasRole: authService.hasRole,
    hasPermission: authService.hasPermission
  };
};

// Student hooks
export const useStudentProfile = (studentId) => {
  return useQuery(
    ['student', 'profile', studentId],
    () => studentService.getProfile(studentId),
    {
      enabled: !!studentId || authService.hasRole('student')
    }
  );
};

export const useStudentCourses = (studentId, params = {}) => {
  return useQuery(
    ['student', 'courses', studentId, params],
    () => studentService.getCourses(studentId, params),
    {
      enabled: !!studentId || authService.hasRole('student')
    }
  );
};

export const useStudentGrades = (studentId, params = {}) => {
  return useQuery(
    ['student', 'grades', studentId, params],
    () => studentService.getGrades(studentId, params),
    {
      enabled: !!studentId || authService.hasRole('student')
    }
  );
};

export const useStudentDashboard = (studentId) => {
  return useQuery(
    ['student', 'dashboard', studentId],
    () => studentService.getDashboardData(studentId),
    {
      enabled: !!studentId || authService.hasRole('student'),
      refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
    }
  );
};

// Instructor hooks
export const useInstructorProfile = (instructorId) => {
  return useQuery(
    ['instructor', 'profile', instructorId],
    () => instructorService.getProfile(instructorId),
    {
      enabled: !!instructorId || authService.hasRole('instructor')
    }
  );
};

export const useInstructorCourses = (instructorId, params = {}) => {
  return useQuery(
    ['instructor', 'courses', instructorId, params],
    () => instructorService.getCourses(instructorId, params),
    {
      enabled: !!instructorId || authService.hasRole('instructor')
    }
  );
};

export const useInstructorDashboard = (instructorId) => {
  return useQuery(
    ['instructor', 'dashboard', instructorId],
    () => instructorService.getDashboardData(instructorId),
    {
      enabled: !!instructorId || authService.hasRole('instructor'),
      refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
    }
  );
};

export const useCourseStudents = (courseId, instructorId) => {
  return useQuery(
    ['instructor', 'course', courseId, 'students'],
    () => instructorService.getCourseStudents(courseId, instructorId),
    {
      enabled: !!courseId && (!!instructorId || authService.hasRole('instructor'))
    }
  );
};

export const useCourseAssignments = (courseId, instructorId) => {
  return useQuery(
    ['instructor', 'course', courseId, 'assignments'],
    () => instructorService.getAssignments(courseId, instructorId),
    {
      enabled: !!courseId && (!!instructorId || authService.hasRole('instructor'))
    }
  );
};

// Admin hooks
export const useAdminUsers = (params = {}) => {
  return useQuery(
    ['admin', 'users', params],
    () => adminService.getAllUsers(params),
    {
      enabled: authService.hasRole('admin')
    }
  );
};

export const useAdminDashboard = () => {
  return useQuery(
    ['admin', 'dashboard'],
    () => adminService.getDashboardAnalytics(),
    {
      enabled: authService.hasRole('admin'),
      refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
    }
  );
};

// Course hooks
export const useCourse = (courseId) => {
  return useQuery(
    ['course', courseId],
    () => courseService.getCourseById(courseId),
    {
      enabled: !!courseId
    }
  );
};

export const useCourses = (params = {}) => {
  return useQuery(
    ['courses', params],
    () => courseService.getAllCourses(params)
  );
};

export const useCourseMaterials = (courseId) => {
  return useQuery(
    ['course', courseId, 'materials'],
    () => courseService.getCourseMaterials(courseId),
    {
      enabled: !!courseId
    }
  );
};

// Mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(adminService.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ userId, userData }) => adminService.updateUser(userId, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'users']);
      }
    }
  );
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(adminService.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation(authService.updateProfile, {
    onSuccess: (data) => {
      queryClient.setQueryData('user', data.user);
      queryClient.invalidateQueries(['student', 'profile']);
      queryClient.invalidateQueries(['instructor', 'profile']);
    }
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation(courseService.enrollInCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['student', 'courses']);
      queryClient.invalidateQueries(['courses']);
    }
  });
};

export const useDropCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation(courseService.dropCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['student', 'courses']);
      queryClient.invalidateQueries(['courses']);
    }
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ courseId, assignmentId, submissionData }) =>
      courseService.submitAssignment(courseId, assignmentId, submissionData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['course', variables.courseId, 'assignments']);
        queryClient.invalidateQueries(['student', 'assignments']);
      }
    }
  );
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ courseId, assignmentId, submissionId, gradeData, instructorId }) =>
      instructorService.gradeSubmission(courseId, assignmentId, submissionId, gradeData, instructorId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['instructor', 'course', variables.courseId, 'assignments']);
        queryClient.invalidateQueries(['instructor', 'course', variables.courseId, 'grades']);
      }
    }
  );
};

// Notification hooks
export const useNotifications = () => {
  const { user } = useAuth();
  
  return useQuery(
    ['notifications'],
    () => {
      if (user?.role === 'student') {
        return studentService.getNotifications();
      } else if (user?.role === 'instructor') {
        return instructorService.getMessages();
      }
      return Promise.resolve({ success: true, data: [] });
    },
    {
      enabled: !!user,
      refetchInterval: 2 * 60 * 1000 // Refetch every 2 minutes
    }
  );
};

// Generic hooks for common operations
export const usePagination = (initialPage = 1, initialSize = 25) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);
  
  const handleSizeChange = useCallback((newSize) => {
    setSize(newSize);
    setPage(1); // Reset to first page when size changes
  }, []);
  
  return {
    page,
    size,
    onPageChange: handlePageChange,
    onSizeChange: handleSizeChange,
    params: { page, limit: size }
  };
};

export const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return {
    query,
    debouncedQuery,
    setQuery,
    clearQuery: () => setQuery('')
  };
};

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);
  
  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);
  
  return {
    filters,
    updateFilter,
    clearFilters,
    removeFilter
  };
};