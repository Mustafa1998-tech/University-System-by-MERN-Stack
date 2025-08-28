import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock Material UI components that cause issues in tests
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ children, ...props }) => <div data-testid="data-grid" {...props}>{children}</div>,
  GridToolbar: () => <div data-testid="grid-toolbar" />,
  GridColumnMenu: () => <div data-testid="grid-column-menu" />,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
      dir: () => 'ltr'
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  Trans: ({ children }) => children,
}));

// Mock our custom i18n hook
jest.mock('../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    formatDate: (date) => new Date(date).toLocaleDateString(),
    formatCurrency: (amount) => `$${amount}`,
    formatNumber: (num) => num.toString(),
    currentLanguage: 'en',
    isRTL: false,
    changeLanguage: jest.fn(),
    dir: 'ltr'
  })
}));

// Mock API services
jest.mock('../services/apiService', () => ({
  get: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  post: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  put: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  patch: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  delete: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  upload: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  download: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock('../services/authService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}));

// Mock React Query
jest.mock('react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});