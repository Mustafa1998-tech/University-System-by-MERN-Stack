import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DynamicForm from '../../components/common/DynamicForm';

// Test helper to wrap component with providers
const renderWithProviders = (component, options = {}) => {
  const theme = createTheme();
  
  const Wrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

describe('DynamicForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render form with simple text field', () => {
      const fields = [
        {
          name: 'firstName',
          type: 'text',
          label: 'First Name',
          required: true
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render form with custom title', () => {
      const fields = [
        { name: 'test', type: 'text', label: 'Test Field' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields}
          title="User Registration Form"
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('User Registration Form')).toBeInTheDocument();
    });

    it('should render multiple fields of different types', () => {
      const fields = [
        { name: 'name', type: 'text', label: 'Name' },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'age', type: 'number', label: 'Age' },
        { name: 'password', type: 'password', label: 'Password' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  describe('Field Types', () => {
    it('should render text field correctly', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'message', type: 'text', label: 'Message' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const textField = screen.getByLabelText(/message/i);
      await user.type(textField, 'Hello World');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          message: 'Hello World'
        });
      });
    });

    it('should render email field with validation', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'email', type: 'email', label: 'Email', required: true }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show validation error for required field
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should render number field with constraints', async () => {
      const user = userEvent.setup();
      const fields = [
        { 
          name: 'age', 
          type: 'number', 
          label: 'Age',
          min: 18,
          max: 100
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const numberField = screen.getByLabelText(/age/i);
      await user.type(numberField, '25');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          age: 25
        });
      });
    });

    it('should render password field with toggle visibility', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'password', type: 'password', label: 'Password' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).toHaveAttribute('type', 'password');

      // Find and click the visibility toggle button
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      await user.click(toggleButton);

      expect(passwordField).toHaveAttribute('type', 'text');
    });

    it('should render select field with options', async () => {
      const user = userEvent.setup();
      const fields = [
        {
          name: 'country',
          type: 'select',
          label: 'Country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'sa', label: 'Saudi Arabia' },
            { value: 'uk', label: 'United Kingdom' }
          ]
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const selectField = screen.getByLabelText(/country/i);
      await user.click(selectField);

      // Check if options are rendered
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Saudi Arabia')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();

      // Select an option
      await user.click(screen.getByText('Saudi Arabia'));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          country: 'sa'
        });
      });
    });

    it('should render multi-select field', async () => {
      const user = userEvent.setup();
      const fields = [
        {
          name: 'skills',
          type: 'select',
          label: 'Skills',
          multiple: true,
          options: [
            { value: 'js', label: 'JavaScript' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' }
          ]
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const selectField = screen.getByLabelText(/skills/i);
      await user.click(selectField);

      // Select multiple options
      await user.click(screen.getByText('JavaScript'));
      await user.click(screen.getByText('Python'));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          skills: ['js', 'python']
        });
      });
    });

    it('should render checkbox field', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'agree', type: 'checkbox', label: 'I agree to terms' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const checkbox = screen.getByLabelText(/i agree to terms/i);
      await user.click(checkbox);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          agree: true
        });
      });
    });

    it('should render radio group field', async () => {
      const user = userEvent.setup();
      const fields = [
        {
          name: 'gender',
          type: 'radio',
          label: 'Gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ]
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const maleRadio = screen.getByLabelText(/male/i);
      await user.click(maleRadio);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          gender: 'male'
        });
      });
    });

    it('should render switch field', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'notifications', type: 'switch', label: 'Enable Notifications' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const switchField = screen.getByLabelText(/enable notifications/i);
      await user.click(switchField);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          notifications: true
        });
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'email', type: 'email', label: 'Email', required: true }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const emailField = screen.getByLabelText(/email/i);
      await user.type(emailField, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('should validate number ranges', async () => {
      const user = userEvent.setup();
      const fields = [
        { 
          name: 'age', 
          type: 'number', 
          label: 'Age',
          min: 18,
          max: 65,
          required: true
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const ageField = screen.getByLabelText(/age/i);
      await user.type(ageField, '10');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/age must be at least 18/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum length', async () => {
      const user = userEvent.setup();
      const fields = [
        { 
          name: 'password', 
          type: 'password', 
          label: 'Password',
          minLength: 8,
          required: true
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const passwordField = screen.getByLabelText(/password/i);
      await user.type(passwordField, '123');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      // Fill in valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com'
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'name', type: 'text', label: 'Name', required: true }
      ];

      // Mock onSubmit to return a pending promise
      const pendingPromise = new Promise(() => {}); // Never resolves
      mockOnSubmit.mockReturnValue(pendingPromise);

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      await user.type(screen.getByLabelText(/name/i), 'John Doe');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'name', type: 'text', label: 'Name', required: true }
      ];

      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      await user.type(screen.getByLabelText(/name/i), 'John Doe');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Initial Values and Data Binding', () => {
    it('should populate form with initial values', () => {
      const fields = [
        { name: 'name', type: 'text', label: 'Name' },
        { name: 'email', type: 'email', label: 'Email' }
      ];

      const initialData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          initialData={initialData}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    it('should call onChange when form data changes', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'name', type: 'text', label: 'Name' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const nameField = screen.getByLabelText(/name/i);
      await user.type(nameField, 'J');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          name: 'J'
        });
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should render fields in specified columns', () => {
      const fields = [
        { name: 'firstName', type: 'text', label: 'First Name', cols: 6 },
        { name: 'lastName', type: 'text', label: 'Last Name', cols: 6 }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      // Both fields should be present
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    it('should apply disabled state to all fields', () => {
      const fields = [
        { name: 'name', type: 'text', label: 'Name' },
        { name: 'email', type: 'email', label: 'Email' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          disabled={true}
        />
      );

      expect(screen.getByLabelText(/name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
    });

    it('should hide submit button when showSubmitButton is false', () => {
      const fields = [
        { name: 'name', type: 'text', label: 'Name' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          showSubmitButton={false}
        />
      );

      expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
    });

    it('should render with custom submit button label', () => {
      const fields = [
        { name: 'name', type: 'text', label: 'Name' }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
          submitLabel="Save Changes"
        />
      );

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  describe('Helper Text and Instructions', () => {
    it('should display field helper text', () => {
      const fields = [
        { 
          name: 'password', 
          type: 'password', 
          label: 'Password',
          helperText: 'Password must be at least 8 characters long'
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });

    it('should display field descriptions', () => {
      const fields = [
        { 
          name: 'bio', 
          type: 'text', 
          label: 'Biography',
          description: 'Tell us a little bit about yourself'
        }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText(/tell us a little bit about yourself/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const fields = [
        { name: 'name', type: 'text', label: 'Full Name', required: true }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const nameField = screen.getByLabelText(/full name/i);
      expect(nameField).toHaveAttribute('aria-required', 'true');
    });

    it('should associate error messages with fields', async () => {
      const user = userEvent.setup();
      const fields = [
        { name: 'email', type: 'email', label: 'Email', required: true }
      ];

      renderWithProviders(
        <DynamicForm 
          fields={fields} 
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const emailField = screen.getByLabelText(/email/i);
        const errorText = screen.getByText(/email is required/i);
        
        expect(emailField).toHaveAttribute('aria-invalid', 'true');
        expect(emailField).toHaveAttribute('aria-describedby', expect.stringContaining(errorText.id));
      });
    });
  });
});