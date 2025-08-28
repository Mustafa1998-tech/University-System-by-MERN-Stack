import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useStudentCourses, useStudentDashboard } from '../hooks/useApi';
import { studentService } from '../services';
import { useI18n } from '../hooks/useI18n';

// Example component showing API integration
const ApiIntegrationExample = () => {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Using React Query hooks
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError
  } = useStudentCourses(user?.id, {
    enabled: isAuthenticated && user?.role === 'student'
  });

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useStudentDashboard(user?.id, {
    enabled: isAuthenticated && user?.role === 'student'
  });

  // Direct API call example
  const handleDirectApiCall = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await studentService.getProfile();
      
      if (response.success) {
        setTestResult({
          type: 'success',
          message: 'API call successful!',
          data: response.data
        });
      } else {
        setTestResult({
          type: 'error',
          message: response.error,
          data: null
        });
      }
    } catch (error) {
      setError(error.message);
      setTestResult({
        type: 'error',
        message: error.message,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert severity=\"warning\">
        {t('auth.pleaseLogin')}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant=\"h4\" gutterBottom>
        API Integration Test
      </Typography>

      {/* User Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant=\"h6\" gutterBottom>
            Current User Information
          </Typography>
          <Typography variant=\"body1\">
            Name: {user?.name}
          </Typography>
          <Typography variant=\"body1\">
            Role: {user?.role}
          </Typography>
          <Typography variant=\"body1\">
            Email: {user?.email}
          </Typography>
        </CardContent>
      </Card>

      {/* React Query Hook Results */}
      {user?.role === 'student' && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant=\"h6\" gutterBottom>
                Student Courses (React Query Hook)
              </Typography>
              {coursesLoading && <CircularProgress size={20} />}
              {coursesError && (
                <Alert severity=\"error\">
                  Error loading courses: {coursesError.message}
                </Alert>
              )}
              {courses && (
                <Typography variant=\"body2\">
                  Loaded {courses.length || 0} courses
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant=\"h6\" gutterBottom>
                Dashboard Data (React Query Hook)
              </Typography>
              {dashboardLoading && <CircularProgress size={20} />}
              {dashboardError && (
                <Alert severity=\"error\">
                  Error loading dashboard: {dashboardError.message}
                </Alert>
              )}
              {dashboardData && (
                <Typography variant=\"body2\">
                  Dashboard data loaded successfully
                </Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Direct API Call Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant=\"h6\" gutterBottom>
            Direct API Call Test
          </Typography>
          
          <Button
            variant=\"contained\"
            onClick={handleDirectApiCall}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Testing API...
              </>
            ) : (
              'Test API Connection'
            )}
          </Button>

          {error && (
            <Alert severity=\"error\" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {testResult && (
            <Alert severity={testResult.type} sx={{ mb: 2 }}>
              {testResult.message}
              {testResult.data && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant=\"caption\">
                    Response received: {JSON.stringify(testResult.data, null, 2).substring(0, 200)}...
                  </Typography>
                </Box>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Status */}
      <Card>
        <CardContent>
          <Typography variant=\"h6\" gutterBottom>
            API Configuration
          </Typography>
          <Typography variant=\"body2\">
            API URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
          </Typography>
          <Typography variant=\"body2\">
            Environment: {process.env.NODE_ENV}
          </Typography>
          <Typography variant=\"body2\">
            App Version: {process.env.REACT_APP_VERSION || '1.0.0'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiIntegrationExample;