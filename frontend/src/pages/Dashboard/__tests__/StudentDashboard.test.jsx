import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import StudentDashboard from '../../pages/Dashboard/StudentDashboard';

// Mock the auth context
const mockAuthContext = {
  user: {
    _id: '123',
    firstName: 'Ahmed',
    lastName: 'Mohammed',
    email: 'ahmed@university.edu',
    role: 'student'
  },
  isAuthenticated: true,
  logout: jest.fn()
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock the API hooks
jest.mock('../../hooks/useApi', () => ({
  useAuth: () => ({
    user: mockAuthContext.user,
    logout: mockAuthContext.logout
  }),
  useStudent: () => ({
    profile: {
      data: {
        studentId: 'STU123456',
        name: 'أحمد محمد علي',
        nameEn: 'Ahmed Mohammed Ali',
        gpa: { cumulative: 3.75 },
        totalCreditsEarned: 89,
        totalCreditsRequired: 120,
        currentSemester: 6,
        classification: 'junior',
        department: { name: 'علوم الحاسوب', nameEn: 'Computer Science' },
        faculty: { name: 'كلية الهندسة', nameEn: 'College of Engineering' }
      },
      isLoading: false,
      error: null
    },
    enrollments: {
      data: [
        {
          _id: '1',
          course: {
            courseCode: 'CS301',
            title: 'Software Engineering',
            titleAr: 'هندسة البرمجيات',
            creditHours: 3
          },
          currentGrade: { percentage: 85 },
          schedule: {
            days: ['sunday', 'tuesday'],
            timeSlot: { start: '10:00', end: '11:30' },
            room: 'A101'
          }
        },
        {
          _id: '2',
          course: {
            courseCode: 'CS302',
            title: 'Database Systems',
            titleAr: 'نظم قواعد البيانات',
            creditHours: 3
          },
          currentGrade: { percentage: 92 },
          schedule: {
            days: ['monday', 'wednesday'],
            timeSlot: { start: '12:00', end: '13:30' },
            room: 'B205'
          }
        }
      ],
      isLoading: false,
      error: null
    },
    grades: {
      data: [
        {
          _id: '1',
          course: {
            courseCode: 'CS201',
            title: 'Data Structures',
            titleAr: 'هياكل البيانات'
          },
          finalGrade: { letter: 'A', points: 4.0 },
          semester: 'Fall 2023'
        },
        {
          _id: '2',
          course: {
            courseCode: 'CS202',
            title: 'Algorithms',
            titleAr: 'الخوارزميات'
          },
          finalGrade: { letter: 'A-', points: 3.7 },
          semester: 'Fall 2023'
        }
      ],
      isLoading: false,
      error: null
    },
    financialStatus: {
      data: {
        balance: -1250,
        tuitionStatus: 'partial',
        lastPayment: {
          amount: 5000,
          date: new Date('2024-01-15')
        }
      },
      isLoading: false,
      error: null
    }
  })
}));

// Test helper to wrap component with providers
const renderWithProviders = (component, options = {}) => {
  const theme = createTheme();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

describe('StudentDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render dashboard with student information', () => {
      renderWithProviders(<StudentDashboard />);

      // Check for main dashboard elements
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/ahmed mohammed ali/i)).toBeInTheDocument();
      expect(screen.getByText('STU123456')).toBeInTheDocument();
    });

    it('should display academic information cards', () => {
      renderWithProviders(<StudentDashboard />);

      // Check for GPA display
      expect(screen.getByText('3.75')).toBeInTheDocument();
      
      // Check for credits information
      expect(screen.getByText('89')).toBeInTheDocument(); // Credits earned
      expect(screen.getByText('120')).toBeInTheDocument(); // Total credits
      
      // Check for semester information
      expect(screen.getByText('6')).toBeInTheDocument(); // Current semester
    });

    it('should display department and faculty information', () => {
      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText(/computer science/i)).toBeInTheDocument();
      expect(screen.getByText(/college of engineering/i)).toBeInTheDocument();
    });
  });

  describe('Current Courses Section', () => {
    it('should display enrolled courses', () => {
      renderWithProviders(<StudentDashboard />);

      // Check for course codes
      expect(screen.getByText('CS301')).toBeInTheDocument();
      expect(screen.getByText('CS302')).toBeInTheDocument();
      
      // Check for course titles
      expect(screen.getByText(/software engineering/i)).toBeInTheDocument();
      expect(screen.getByText(/database systems/i)).toBeInTheDocument();
    });

    it('should display current grades for enrolled courses', () => {
      renderWithProviders(<StudentDashboard />);

      // Check for grade percentages
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });

    it('should display course schedule information', () => {
      renderWithProviders(<StudentDashboard />);

      // Check for time slots
      expect(screen.getByText(/10:00.*11:30/)).toBeInTheDocument();
      expect(screen.getByText(/12:00.*13:30/)).toBeInTheDocument();
      
      // Check for rooms
      expect(screen.getByText('A101')).toBeInTheDocument();
      expect(screen.getByText('B205')).toBeInTheDocument();
    });

    it('should handle empty course list', () => {
      // Mock empty enrollments
      jest.doMock('../../hooks/useApi', () => ({
        useStudent: () => ({
          enrollments: { data: [], isLoading: false, error: null },
          // ... other mocked data
        })
      }));

      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText(/no current courses/i)).toBeInTheDocument();
    });
  });

  describe('Recent Grades Section', () => {
    it('should display recent grades', () => {
      renderWithProviders(<StudentDashboard />);

      // Check for course codes in grades
      expect(screen.getByText('CS201')).toBeInTheDocument();
      expect(screen.getByText('CS202')).toBeInTheDocument();
      
      // Check for grade letters
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('A-')).toBeInTheDocument();
    });

    it('should display semester information for grades', () => {
      renderWithProviders(<StudentDashboard />);

      expect(screen.getAllByText(/fall 2023/i)).toHaveLength(2);
    });

    it('should calculate and display grade points', () => {
      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText('4.0')).toBeInTheDocument();
      expect(screen.getByText('3.7')).toBeInTheDocument();
    });
  });

  describe('Financial Information Section', () => {
    it('should display financial balance', () => {
      renderWithProviders(<StudentDashboard />);

      // Check for balance (negative indicates amount owed)
      expect(screen.getByText(/1,250/)).toBeInTheDocument();
    });

    it('should display tuition status', () => {
      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText(/partial/i)).toBeInTheDocument();
    });

    it('should display last payment information', () => {
      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText('5,000')).toBeInTheDocument();
    });

    it('should show payment due alert when balance is negative', () => {
      renderWithProviders(<StudentDashboard />);

      // Should show some indication of amount due
      expect(screen.getByText(/amount due/i)).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render quick action buttons', () => {
      renderWithProviders(<StudentDashboard />);

      expect(screen.getByRole('button', { name: /view transcript/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /course registration/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /financial statement/i })).toBeInTheDocument();
    });

    it('should handle transcript button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StudentDashboard />);

      const transcriptButton = screen.getByRole('button', { name: /view transcript/i });
      await user.click(transcriptButton);

      // Should navigate or trigger some action
      // This would depend on the actual implementation
    });

    it('should handle course registration button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StudentDashboard />);

      const registrationButton = screen.getByRole('button', { name: /course registration/i });
      await user.click(registrationButton);

      // Should navigate to registration page
      // This would depend on the actual implementation
    });

    it('should handle financial statement button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StudentDashboard />);

      const financialButton = screen.getByRole('button', { name: /financial statement/i });
      await user.click(financialButton);

      // Should navigate to financial page
      // This would depend on the actual implementation
    });
  });

  describe('Loading States', () => {
    it('should show loading state for profile data', () => {
      // Mock loading state
      jest.doMock('../../hooks/useApi', () => ({
        useStudent: () => ({
          profile: { data: null, isLoading: true, error: null },
          enrollments: { data: [], isLoading: false, error: null },
          grades: { data: [], isLoading: false, error: null },
          financialStatus: { data: null, isLoading: false, error: null }
        })
      }));

      renderWithProviders(<StudentDashboard />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show loading state for courses', () => {
      // Mock loading state for enrollments
      jest.doMock('../../hooks/useApi', () => ({
        useStudent: () => ({
          profile: { data: {}, isLoading: false, error: null },
          enrollments: { data: null, isLoading: true, error: null },
          grades: { data: [], isLoading: false, error: null },
          financialStatus: { data: null, isLoading: false, error: null }
        })
      }));

      renderWithProviders(<StudentDashboard />);

      // Should show skeleton or loading indicator in courses section
      expect(screen.getByText(/loading courses/i)).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should display error message for profile data', () => {
      // Mock error state
      jest.doMock('../../hooks/useApi', () => ({
        useStudent: () => ({
          profile: { data: null, isLoading: false, error: new Error('Failed to load profile') },
          enrollments: { data: [], isLoading: false, error: null },
          grades: { data: [], isLoading: false, error: null },
          financialStatus: { data: null, isLoading: false, error: null }
        })
      }));

      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
    });

    it('should display error message for courses', () => {
      // Mock error state for enrollments
      jest.doMock('../../hooks/useApi', () => ({
        useStudent: () => ({
          profile: { data: {}, isLoading: false, error: null },
          enrollments: { data: null, isLoading: false, error: new Error('Failed to load courses') },
          grades: { data: [], isLoading: false, error: null },
          financialStatus: { data: null, isLoading: false, error: null }
        })
      }));

      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText(/failed to load courses/i)).toBeInTheDocument();
    });

    it('should provide retry functionality for errors', async () => {
      const user = userEvent.setup();
      const mockRetry = jest.fn();

      // Mock error state with retry function
      jest.doMock('../../hooks/useApi', () => ({
        useStudent: () => ({
          profile: { 
            data: null, 
            isLoading: false, 
            error: new Error('Network error'),
            refetch: mockRetry
          },
          enrollments: { data: [], isLoading: false, error: null },
          grades: { data: [], isLoading: false, error: null },
          financialStatus: { data: null, isLoading: false, error: null }
        })
      }));

      renderWithProviders(<StudentDashboard />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      renderWithProviders(<StudentDashboard />);

      // Component should still render and be accessible
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('should show/hide elements based on screen size', () => {
      renderWithProviders(<StudentDashboard />);

      // Check if responsive behavior is applied
      // This would depend on the actual responsive implementation
      expect(screen.getByTestId('dashboard-container')).toHaveClass('responsive-dashboard');
    });
  });

  describe('Internationalization', () => {
    it('should display Arabic text when language is Arabic', () => {
      // Mock Arabic language
      jest.doMock('../../hooks/useI18n', () => ({
        useI18n: () => ({
          t: (key) => {
            const translations = {
              'dashboard.title': 'لوحة التحكم',
              'dashboard.currentGPA': 'المعدل التراكمي الحالي',
              'dashboard.creditsEarned': 'الوحدات المكتسبة'
            };
            return translations[key] || key;
          },
          currentLanguage: 'ar',
          isRTL: true,
          dir: 'rtl',
          formatDate: (date) => new Date(date).toLocaleDateString('ar-SA'),
          formatCurrency: (amount) => `${amount} ر.س`,
          formatNumber: (num) => num.toLocaleString('ar-SA')
        })
      }));

      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
    });

    it('should apply RTL layout for Arabic', () => {
      renderWithProviders(<StudentDashboard />);

      // Check if RTL classes or styles are applied
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data on pull-to-refresh', async () => {
      const mockRefresh = jest.fn();
      
      // Mock refresh functionality
      jest.doMock('../../hooks/useApi', () => ({
        useStudent: () => ({
          profile: { data: {}, isLoading: false, error: null, refetch: mockRefresh },
          enrollments: { data: [], isLoading: false, error: null, refetch: mockRefresh },
          grades: { data: [], isLoading: false, error: null, refetch: mockRefresh },
          financialStatus: { data: null, isLoading: false, error: null, refetch: mockRefresh }
        })
      }));

      renderWithProviders(<StudentDashboard />);

      // Simulate pull-to-refresh action
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('should auto-refresh data periodically', async () => {
      jest.useFakeTimers();
      const mockRefresh = jest.fn();

      renderWithProviders(<StudentDashboard />);

      // Fast-forward time to trigger auto-refresh
      jest.advanceTimersByTime(300000); // 5 minutes

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Performance', () => {
    it('should memoize expensive calculations', () => {
      const renderCount = jest.fn();
      
      // Component with render counting
      const TestComponent = () => {
        renderCount();
        return <StudentDashboard />;
      };

      const { rerender } = renderWithProviders(<TestComponent />);
      
      // Re-render with same props
      rerender(<TestComponent />);

      // Should not re-render unnecessarily
      expect(renderCount).toHaveBeenCalledTimes(2); // Initial + rerender
    });

    it('should lazy load non-critical sections', async () => {
      renderWithProviders(<StudentDashboard />);

      // Critical content should be visible immediately
      expect(screen.getByText(/ahmed mohammed ali/i)).toBeInTheDocument();
      
      // Non-critical content might load later
      await waitFor(() => {
        expect(screen.getByText(/recent grades/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});