import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Checkbox,
  Toolbar,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';

const DataTable = ({
  title,
  data = [],
  columns = [],
  loading = false,
  error = null,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  orderBy = '',
  order = 'asc',
  searchTerm = '',
  filters = {},
  selectedRows = [],
  showCheckboxes = false,
  showActions = true,
  showSearch = true,
  showFilters = true,
  showExport = true,
  showAdd = true,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onSearch,
  onFilter,
  onRowSelect,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onExport,
  onRefresh,
  customActions = [],
  emptyMessage,
  noDataIcon
}) => {
  const { t, isRTL, getTextAlign, formatNumber } = useI18n();
  
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [filterValues, setFilterValues] = useState(filters);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  // Handle search with debounce
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearch && onSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle filter changes
  const handleFilterChange = (column, value) => {
    const newFilters = { ...filterValues, [column]: value };
    setFilterValues(newFilters);
    onFilter && onFilter(newFilters);
  };

  // Handle row selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      onRowSelect && onRowSelect(newSelected);
    } else {
      onRowSelect && onRowSelect([]);
    }
  };

  const handleRowCheck = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    onRowSelect && onRowSelect(newSelected);
  };

  // Handle sorting
  const handleSort = (column) => {
    const isAsc = orderBy === column && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    onSort && onSort(column, newOrder);
  };

  // Handle action menu
  const handleActionMenuOpen = (event, row) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActionMenuRow(row);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuRow(null);
  };

  // Memoized filtered columns for filters
  const filterableColumns = useMemo(() => {
    return columns.filter(column => column.filterable);
  }, [columns]);

  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          minHeight: '64px !important',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}
      >
        <Box sx={{ flex: '1 1 100%', textAlign: getTextAlign() }}>
          {selectedRows.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color=\"inherit\"
              variant=\"subtitle1\"
              component=\"div\"
            >
              {t('common.selected', { count: selectedRows.length })}
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant=\"h6\"
              component=\"div\"
            >
              {title}
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {showSearch && (
            <TextField
              size=\"small\"
              placeholder={t('common.search')}
              value={searchInput}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position=\"start\">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {showFilters && filterableColumns.length > 0 && (
            <Tooltip title={t('common.filter')}>
              <IconButton
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                color={Object.keys(filterValues).length > 0 ? 'primary' : 'default'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          )}

          {onRefresh && (
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}

          {showExport && onExport && (
            <Tooltip title={t('common.export')}>
              <IconButton onClick={onExport}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
          )}

          {showAdd && onAdd && (
            <Button
              variant=\"contained\"
              startIcon={<AddIcon />}
              onClick={onAdd}
              size=\"small\"
            >
              {t('common.add')}
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Active Filters */}
      {Object.keys(filterValues).length > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(filterValues).map(([key, value]) => {
              const column = columns.find(col => col.id === key);
              return (
                <Chip
                  key={key}
                  label={`${column?.label || key}: ${value}`}
                  onDelete={() => handleFilterChange(key, '')}
                  size=\"small\"
                  variant=\"outlined\"
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity=\"error\" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {showCheckboxes && (
                <TableCell padding=\"checkbox\">
                  <Checkbox
                    color=\"primary\"
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || (isRTL ? 'right' : 'left')}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              
              {showActions && (
                <TableCell align=\"center\">
                  {t('common.actions')}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showCheckboxes ? 1 : 0) + (showActions ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showCheckboxes ? 1 : 0) + (showActions ? 1 : 0)}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    {noDataIcon}
                    <Typography variant=\"body1\" color=\"text.secondary\" sx={{ mt: 2 }}>
                      {emptyMessage || t('common.noData')}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    role=\"checkbox\"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {showCheckboxes && (
                      <TableCell padding=\"checkbox\">
                        <Checkbox
                          color=\"primary\"
                          checked={isItemSelected}
                          onChange={(event) => handleRowCheck(event, row.id)}
                        />
                      </TableCell>
                    )}
                    
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || (isRTL ? 'right' : 'left')}
                        >
                          {column.render ? column.render(value, row) : value}
                        </TableCell>
                      );
                    })}
                    
                    {showActions && (
                      <TableCell align=\"center\">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {onView && (
                            <Tooltip title={t('common.view')}>
                              <IconButton
                                size=\"small\"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(row);
                                }}
                              >
                                <ViewIcon fontSize=\"small\" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {onEdit && (
                            <Tooltip title={t('common.edit')}>
                              <IconButton
                                size=\"small\"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(row);
                                }}
                              >
                                <EditIcon fontSize=\"small\" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(onDelete || customActions.length > 0) && (
                            <Tooltip title={t('common.actions')}>
                              <IconButton
                                size=\"small\"
                                onClick={(e) => handleActionMenuOpen(e, row)}
                              >
                                <MoreIcon fontSize=\"small\" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component=\"div\"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage={t('pagination.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          `${formatNumber(from)}-${formatNumber(to)} ${t('pagination.of')} ${formatNumber(count)}`
        }
      />

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 250, p: 2 } }}
      >
        <Typography variant=\"h6\" sx={{ mb: 2 }}>
          {t('common.filter')}
        </Typography>
        
        {filterableColumns.map((column) => (
          <FormControl fullWidth key={column.id} sx={{ mb: 2 }}>
            <InputLabel>{column.label}</InputLabel>
            <Select
              value={filterValues[column.id] || ''}
              label={column.label}
              onChange={(e) => handleFilterChange(column.id, e.target.value)}
              size=\"small\"
            >
              <MenuItem value=\"\">
                <em>{t('common.all')}</em>
              </MenuItem>
              {column.filterOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Menu>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        {customActions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              action.onClick(actionMenuRow);
              handleActionMenuClose();
            }}
            disabled={action.disabled && action.disabled(actionMenuRow)}
          >
            {action.icon && <Box sx={{ mr: 1 }}>{action.icon}</Box>}
            {action.label}
          </MenuItem>
        ))}
        
        {onDelete && (
          <MenuItem
            onClick={() => {
              onDelete(actionMenuRow);
              handleActionMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            {t('common.delete')}
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default DataTable;