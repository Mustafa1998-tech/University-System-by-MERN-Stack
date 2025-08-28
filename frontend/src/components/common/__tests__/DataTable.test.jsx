import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DataTable from '../../components/common/DataTable';

// Test helper to wrap component with providers
const renderWithProviders = (component, options = {}) => {
  const theme = createTheme();
  
  const Wrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

describe('DataTable Component', () => {
  const mockOnRowClick = jest.fn();
  const mockOnSort = jest.fn();
  const mockOnFilter = jest.fn();
  const mockOnPageChange = jest.fn();
  const mockOnRowsPerPageChange = jest.fn();

  const sampleColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 120 }
  ];

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'Moderator' },
    { id: 4, name: 'Sara Wilson', email: 'sara@example.com', role: 'User' },
    { id: 5, name: 'Mike Johnson', email: 'mike@example.com', role: 'Admin' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render table with data', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
        />
      );

      // Check if data grid is rendered
      expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });

    it('should display column headers', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
        />
      );

      // Check column headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          title="User Management"
        />
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={[]}
        />
      );

      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });

    it('should render loading state', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          loading={true}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('should render search box when searchable is true', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          searchable={true}
        />
      );

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should call onFilter when search text changes', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          searchable={true}
          onFilter={mockOnFilter}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(mockOnFilter).toHaveBeenCalledWith('John');
      });
    });

    it('should render advanced filters when provided', () => {
      const filters = [
        {
          field: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' }
          ]
        }
      ];

      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          filters={filters}
          showFilters={true}
        />
      );

      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          searchable={true}
          onFilter={mockOnFilter}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');

      const clearButton = screen.getByLabelText(/clear search/i);
      await user.click(clearButton);

      expect(searchInput.value).toBe('');
      expect(mockOnFilter).toHaveBeenCalledWith('');
    });
  });

  describe('Pagination', () => {
    it('should render pagination when enabled', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          pagination={true}
          pageSize={3}
          totalRows={sampleData.length}
        />
      );

      // Should render pagination controls
      expect(screen.getByLabelText(/rows per page/i)).toBeInTheDocument();
    });

    it('should call onPageChange when page changes', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData.slice(0, 3)}
          pagination={true}
          pageSize={3}
          totalRows={sampleData.length}
          currentPage={0}
          onPageChange={mockOnPageChange}
        />
      );

      // Find and click next page button
      const nextButton = screen.getByLabelText(/go to next page/i);
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onRowsPerPageChange when page size changes', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          pagination={true}
          pageSize={5}
          onRowsPerPageChange={mockOnRowsPerPageChange}
        />
      );

      const pageSizeSelect = screen.getByLabelText(/rows per page/i);
      await user.click(pageSizeSelect);

      // Select different page size
      await user.click(screen.getByText('10'));

      expect(mockOnRowsPerPageChange).toHaveBeenCalledWith(10);
    });

    it('should display correct pagination info', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData.slice(0, 3)}
          pagination={true}
          pageSize={3}
          totalRows={sampleData.length}
          currentPage={0}
        />
      );

      expect(screen.getByText(/1–3 of 5/)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should handle column sorting', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          sortable={true}
          onSort={mockOnSort}
        />
      );

      // Click on Name column header to sort
      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      expect(mockOnSort).toHaveBeenCalledWith([{
        field: 'name',
        sort: 'asc'
      }]);
    });

    it('should toggle sort direction on multiple clicks', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          sortable={true}
          onSort={mockOnSort}
        />
      );

      const nameHeader = screen.getByText('Name');
      
      // First click - ascending
      await user.click(nameHeader);
      expect(mockOnSort).toHaveBeenCalledWith([{
        field: 'name',
        sort: 'asc'
      }]);

      // Second click - descending
      await user.click(nameHeader);
      expect(mockOnSort).toHaveBeenCalledWith([{
        field: 'name',
        sort: 'desc'
      }]);

      // Third click - no sort
      await user.click(nameHeader);
      expect(mockOnSort).toHaveBeenCalledWith([]);
    });
  });

  describe('Row Actions', () => {
    it('should render action buttons when provided', () => {
      const actions = [
        {
          icon: 'edit',
          label: 'Edit',
          onClick: jest.fn()
        },
        {
          icon: 'delete',
          label: 'Delete',
          onClick: jest.fn(),
          color: 'error'
        }
      ];

      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          actions={actions}
        />
      );

      // Should render action buttons for each row
      expect(screen.getAllByLabelText(/edit/i)).toHaveLength(sampleData.length);
      expect(screen.getAllByLabelText(/delete/i)).toHaveLength(sampleData.length);
    });

    it('should call action onClick when button is clicked', async () => {
      const user = userEvent.setup();
      const mockEditAction = jest.fn();
      
      const actions = [
        {
          icon: 'edit',
          label: 'Edit',
          onClick: mockEditAction
        }
      ];

      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData.slice(0, 1)}
          actions={actions}
        />
      );

      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      expect(mockEditAction).toHaveBeenCalledWith(sampleData[0]);
    });

    it('should handle conditional actions', () => {
      const actions = [
        {
          icon: 'delete',
          label: 'Delete',
          onClick: jest.fn(),
          condition: (row) => row.role !== 'Admin'
        }
      ];

      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          actions={actions}
        />
      );

      // Should only show delete button for non-admin users
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      const nonAdminRows = sampleData.filter(row => row.role !== 'Admin');
      expect(deleteButtons).toHaveLength(nonAdminRows.length);
    });
  });

  describe('Row Selection', () => {
    it('should render checkboxes when selectable is true', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          selectable={true}
        />
      );

      // Should render checkbox for each row plus header
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(sampleData.length + 1);
    });

    it('should handle row selection', async () => {
      const user = userEvent.setup();
      const mockOnSelectionChange = jest.fn();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          selectable={true}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Click first row checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Skip header checkbox

      expect(mockOnSelectionChange).toHaveBeenCalledWith([sampleData[0].id]);
    });

    it('should handle select all', async () => {
      const user = userEvent.setup();
      const mockOnSelectionChange = jest.fn();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          selectable={true}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Click header checkbox to select all
      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(headerCheckbox);

      const allIds = sampleData.map(row => row.id);
      expect(mockOnSelectionChange).toHaveBeenCalledWith(allIds);
    });
  });

  describe('Row Click Handling', () => {
    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          onRowClick={mockOnRowClick}
        />
      );

      // Click on first row
      const firstRowCell = screen.getByText('John Doe');
      await user.click(firstRowCell);

      expect(mockOnRowClick).toHaveBeenCalledWith(sampleData[0]);
    });

    it('should not call onRowClick when action button is clicked', async () => {
      const user = userEvent.setup();
      const mockActionClick = jest.fn();
      
      const actions = [
        {
          icon: 'edit',
          label: 'Edit',
          onClick: mockActionClick
        }
      ];

      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData.slice(0, 1)}
          onRowClick={mockOnRowClick}
          actions={actions}
        />
      );

      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      expect(mockActionClick).toHaveBeenCalled();
      expect(mockOnRowClick).not.toHaveBeenCalled();
    });
  });

  describe('Toolbar and Bulk Actions', () => {
    it('should render toolbar when provided', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          showToolbar={true}
        />
      );

      expect(screen.getByTestId('grid-toolbar')).toBeInTheDocument();
    });

    it('should render bulk actions when rows are selected', async () => {
      const user = userEvent.setup();
      const bulkActions = [
        {
          label: 'Delete Selected',
          icon: 'delete',
          onClick: jest.fn()
        }
      ];
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          selectable={true}
          bulkActions={bulkActions}
        />
      );

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      });
    });

    it('should call bulk action onClick with selected rows', async () => {
      const user = userEvent.setup();
      const mockBulkAction = jest.fn();
      const bulkActions = [
        {
          label: 'Delete Selected',
          icon: 'delete',
          onClick: mockBulkAction
        }
      ];
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          selectable={true}
          bulkActions={bulkActions}
          selectedRows={[sampleData[0].id, sampleData[1].id]}
        />
      );

      const bulkActionButton = screen.getByText('Delete Selected');
      await user.click(bulkActionButton);

      expect(mockBulkAction).toHaveBeenCalledWith([sampleData[0], sampleData[1]]);
    });
  });

  describe('Export Functionality', () => {
    it('should render export button when exportable is true', () => {
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          exportable={true}
        />
      );

      expect(screen.getByLabelText(/export/i)).toBeInTheDocument();
    });

    it('should call onExport when export button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnExport = jest.fn();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          exportable={true}
          onExport={mockOnExport}
        />
      );

      const exportButton = screen.getByLabelText(/export/i);
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(sampleData, 'csv');
    });

    it('should support multiple export formats', async () => {
      const user = userEvent.setup();
      const mockOnExport = jest.fn();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          exportable={true}
          exportFormats={['csv', 'excel', 'pdf']}
          onExport={mockOnExport}
        />
      );

      const exportButton = screen.getByLabelText(/export/i);
      await user.click(exportButton);

      // Should show export format options
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();

      // Click Excel option
      await user.click(screen.getByText('Excel'));

      expect(mockOnExport).toHaveBeenCalledWith(sampleData, 'excel');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'Failed to load data';
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={[]}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show retry button when error occurs', async () => {
      const user = userEvent.setup();
      const mockOnRetry = jest.fn();
      
      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={[]}
          error="Failed to load data"
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile viewport', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      renderWithProviders(
        <DataTable 
          columns={sampleColumns}
          data={sampleData}
          responsive={true}
        />
      );

      // Component should still render
      expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });

    it('should hide/show columns based on screen size', () => {
      const responsiveColumns = [
        { field: 'id', headerName: 'ID', width: 90, hiddenOnMobile: true },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 200, hiddenOnTablet: true }
      ];

      renderWithProviders(
        <DataTable 
          columns={responsiveColumns}
          data={sampleData}
          responsive={true}
        />
      );

      // Should render the responsive data grid
      expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });
  });
});