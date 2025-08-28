import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { I18nextProvider } from 'react-i18next';
import { useTranslation } from 'react-i18next';

// Store and i18n
import { store, persistor } from './store/store';
import './i18n'; // Initialize i18n

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Providers
import RTLProvider from './components/providers/RTLProvider';

// Layout Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/UI/ErrorBoundary';

// Auth Components
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Lazy loaded components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const StudentDashboard = React.lazy(() => import('./pages/Dashboard/StudentDashboard'));
const InstructorDashboard = React.lazy(() => import('./pages/Dashboard/InstructorDashboard'));
const StaffDashboard = React.lazy(() => import('./pages/Dashboard/StaffDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/Dashboard/AdminDashboard'));

// Student Pages
const StudentProfile = React.lazy(() => import('./pages/Student/StudentProfile'));
const StudentCourses = React.lazy(() => import('./pages/Student/StudentCourses'));
const StudentGrades = React.lazy(() => import('./pages/Student/StudentGrades'));
const StudentTranscript = React.lazy(() => import('./pages/Student/StudentTranscript'));
const StudentFinances = React.lazy(() => import('./pages/Student/StudentFinances'));
const StudentAttendance = React.lazy(() => import('./pages/Student/StudentAttendance'));

// Instructor Pages
const InstructorProfile = React.lazy(() => import('./pages/Instructor/InstructorProfile'));
const InstructorCourses = React.lazy(() => import('./pages/Instructor/InstructorCourses'));
const InstructorStudents = React.lazy(() => import('./pages/Instructor/InstructorStudents'));
const InstructorGrades = React.lazy(() => import('./pages/Instructor/InstructorGrades'));
const InstructorAttendance = React.lazy(() => import('./pages/Instructor/InstructorAttendance'));

// Staff Pages
const StaffProfile = React.lazy(() => import('./pages/Staff/StaffProfile'));
const StaffStudents = React.lazy(() => import('./pages/Staff/StaffStudents'));
const StaffCourses = React.lazy(() => import('./pages/Staff/StaffCourses'));
const StaffReports = React.lazy(() => import('./pages/Staff/StaffReports'));
const StaffFinances = React.lazy(() => import('./pages/Staff/StaffFinances'));

// Admin Pages
const AdminUsers = React.lazy(() => import('./pages/Admin/AdminUsers'));
const AdminStudents = React.lazy(() => import('./pages/Admin/AdminStudents'));
const AdminInstructors = React.lazy(() => import('./pages/Admin/AdminInstructors'));
const AdminStaff = React.lazy(() => import('./pages/Admin/AdminStaff'));
const AdminCourses = React.lazy(() => import('./pages/Admin/AdminCourses'));
const AdminDepartments = React.lazy(() => import('./pages/Admin/AdminDepartments'));
const AdminFaculties = React.lazy(() => import('./pages/Admin/AdminFaculties'));
const AdminReports = React.lazy(() => import('./pages/Admin/AdminReports'));
const AdminSettings = React.lazy(() => import('./pages/Admin/AdminSettings'));

// Shared Pages
const Profile = React.lazy(() => import('./pages/Shared/Profile'));
const Settings = React.lazy(() => import('./pages/Shared/Settings'));
const Library = React.lazy(() => import('./pages/Shared/Library'));
const Events = React.lazy(() => import('./pages/Shared/Events'));
const Alumni = React.lazy(() => import('./pages/Shared/Alumni'));
const Research = React.lazy(() => import('./pages/Shared/Research'));

// Error Pages
const NotFound = React.lazy(() => import('./pages/Error/NotFound'));
const Unauthorized = React.lazy(() => import('./pages/Error/Unauthorized'));

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create Material-UI theme
const createAppTheme = (mode, direction, language) => {
  return createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: '#2563eb',
        light: '#60a5fa',
        dark: '#1d4ed8',
      },
      secondary: {
        main: '#64748b',
        light: '#94a3b8',
        dark: '#475569',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
    },
    typography: {
      fontFamily: language === 'ar' 
        ? '"Tajawal", "Cairo", "Amiri", sans-serif'
        : '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            direction,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '0.75rem',
            boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.5rem',
            },
          },
        },
      },
    },
  });
};

function App() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = React.useState(() => 
    createAppTheme('light', 'ltr', 'en')
  );

  // Update theme based on language and dark mode
  const updateTheme = React.useCallback((darkMode, language) => {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    const mode = darkMode ? 'dark' : 'light';
    setTheme(createAppTheme(mode, direction, language));
    
    // Update document direction and class
    document.dir = direction;
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.lang = language;
  }, []);

  useEffect(() => {
    // Set initial theme based on system preference and stored language
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedLanguage = localStorage.getItem('language') || 'en';
    updateTheme(prefersDarkMode, storedLanguage);
  }, [updateTheme]);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <RTLProvider theme={theme}>
              <CssBaseline />
              <LanguageProvider onLanguageChange={updateTheme}>
                <AuthProvider>
                    <Router>
                      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password/:token" element={<ResetPassword />} />
                          <Route path="/verify-email/:token" element={<VerifyEmail />} />

                          {/* Protected Routes */}
                          <Route path="/" element={
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<LoadingSpinner />}>
                                  <Routes>
                                    {/* Dashboard Routes */}
                                    <Route index element={<Navigate to="/dashboard" replace />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    
                                    {/* Role-specific Dashboards */}
                                    <Route path="student-dashboard" element={
                                      <ProtectedRoute allowedRoles={['student']}>
                                        <StudentDashboard />
                                      </ProtectedRoute>
                                    } />
                                    
                                    <Route path="instructor-dashboard" element={
                                      <ProtectedRoute allowedRoles={['instructor']}>
                                        <InstructorDashboard />
                                      </ProtectedRoute>
                                    } />
                                    
                                    <Route path="staff-dashboard" element={
                                      <ProtectedRoute allowedRoles={['staff']}>
                                        <StaffDashboard />
                                      </ProtectedRoute>
                                    } />
                                    
                                    <Route path="admin-dashboard" element={
                                      <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                      </ProtectedRoute>
                                    } />

                                    {/* Student Routes */}
                                    <Route path="student/*" element={
                                      <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                                        <Routes>
                                          <Route path="profile" element={<StudentProfile />} />
                                          <Route path="courses" element={<StudentCourses />} />
                                          <Route path="grades" element={<StudentGrades />} />
                                          <Route path="transcript" element={<StudentTranscript />} />
                                          <Route path="finances" element={<StudentFinances />} />
                                          <Route path="attendance" element={<StudentAttendance />} />
                                        </Routes>
                                      </ProtectedRoute>
                                    } />

                                    {/* Instructor Routes */}
                                    <Route path="instructor/*" element={
                                      <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                                        <Routes>
                                          <Route path="profile" element={<InstructorProfile />} />
                                          <Route path="courses" element={<InstructorCourses />} />
                                          <Route path="students" element={<InstructorStudents />} />
                                          <Route path="grades" element={<InstructorGrades />} />
                                          <Route path="attendance" element={<InstructorAttendance />} />
                                        </Routes>
                                      </ProtectedRoute>
                                    } />

                                    {/* Staff Routes */}
                                    <Route path="staff/*" element={
                                      <ProtectedRoute allowedRoles={['staff', 'admin']}>
                                        <Routes>
                                          <Route path="profile" element={<StaffProfile />} />
                                          <Route path="students" element={<StaffStudents />} />
                                          <Route path="courses" element={<StaffCourses />} />
                                          <Route path="reports" element={<StaffReports />} />
                                          <Route path="finances" element={<StaffFinances />} />
                                        </Routes>
                                      </ProtectedRoute>
                                    } />

                                    {/* Admin Routes */}
                                    <Route path="admin/*" element={
                                      <ProtectedRoute allowedRoles={['admin']}>
                                        <Routes>
                                          <Route path="users" element={<AdminUsers />} />
                                          <Route path="students" element={<AdminStudents />} />
                                          <Route path="instructors" element={<AdminInstructors />} />
                                          <Route path="staff" element={<AdminStaff />} />
                                          <Route path="courses" element={<AdminCourses />} />
                                          <Route path="departments" element={<AdminDepartments />} />
                                          <Route path="faculties" element={<AdminFaculties />} />
                                          <Route path="reports" element={<AdminReports />} />
                                          <Route path="settings" element={<AdminSettings />} />
                                        </Routes>
                                      </ProtectedRoute>
                                    } />

                                    {/* Shared Routes */}
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="settings" element={<Settings />} />
                                    <Route path="library" element={<Library />} />
                                    <Route path="events" element={<Events />} />
                                    <Route path="alumni" element={<Alumni />} />
                                    <Route path="research" element={<Research />} />

                                    {/* Error Routes */}
                                    <Route path="unauthorized" element={<Unauthorized />} />
                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          } />

                          {/* Catch all route */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>

                        {/* Toast Notifications */}
                        <ToastContainer
                          position="top-right"
                          autoClose={5000}
                          hideProgressBar={false}
                          newestOnTop={false}
                          closeOnClick
                          rtl={i18n.language === 'ar'}
                          pauseOnFocusLoss
                          draggable
                          pauseOnHover
                          className="toast-container"
                        />
                      </div>
                    </Router>
                  </AuthProvider>
                </LanguageProvider>
              </RTLProvider>
            </QueryClientProvider>
          </PersistGate>
        </Provider>
    </ErrorBoundary>
  );
}

export default App;