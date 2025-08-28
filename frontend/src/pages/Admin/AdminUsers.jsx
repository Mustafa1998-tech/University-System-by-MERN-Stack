import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Tab,
  Tabs,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Avatar,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';
import DataTable from '../../components/common/DataTable';
import DynamicForm from '../../components/common/DynamicForm';
import {
  StatWidget,
  ListWidget
} from '../../components/widgets/DashboardWidgets';

const AdminUsers = () => {
  const { t, formatDate, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserForMenu, setSelectedUserForMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    department: ''
  });

  // Mock users data
  const usersData = [
    {
      id: 1,
      name: 'د. محمد أحمد الشريف',
      nameEn: 'Dr. Mohammed Ahmed Al-Sharif',
      email: 'mohammed.ahmed@university.edu',
      phone: '+966501234567',
      role: 'instructor',
      status: 'active',
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      lastLogin: new Date('2024-02-10T09:30:00'),
      createdAt: new Date('2020-09-01'),
      avatar: '/images/instructor-avatar.jpg',
      employeeId: 'EMP001',
      position: 'أستاذ مساعد',
      positionEn: 'Assistant Professor'
    },
    {
      id: 2,
      name: 'أحمد محمد علي',
      nameEn: 'Ahmed Mohammed Ali',
      email: 'ahmed.mohammed@university.edu',
      phone: '+966501234568',
      role: 'student',
      status: 'active',
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      lastLogin: new Date('2024-02-10T14:20:00'),
      createdAt: new Date('2021-09-01'),
      avatar: '/images/student-avatar.jpg',
      studentId: 'STU123456',
      level: 'السنة الثالثة',
      levelEn: 'Third Year'
    },
    {
      id: 3,
      name: 'سارة أحمد محمد',
      nameEn: 'Sara Ahmed Mohammed',
      email: 'sara.ahmed@university.edu',
      phone: '+966501234569',
      role: 'staff',
      status: 'active',
      department: 'شؤون الطلاب',
      departmentEn: 'Student Affairs',
      lastLogin: new Date('2024-02-10T11:45:00'),
      createdAt: new Date('2020-03-15'),
      avatar: '/images/staff-avatar.jpg',
      employeeId: 'STF001',
      position: 'منسق شؤون الطلاب',
      positionEn: 'Student Affairs Coordinator'
    },
    {
      id: 4,
      name: 'عبدالله سالم أحمد',
      nameEn: 'Abdullah Salem Ahmed',
      email: 'abdullah.salem@university.edu',
      phone: '+966501234570',
      role: 'admin',
      status: 'active',
      department: 'الإدارة العامة',
      departmentEn: 'General Administration',
      lastLogin: new Date('2024-02-10T16:00:00'),
      createdAt: new Date('2019-01-01'),
      avatar: '/images/admin-avatar.jpg',
      employeeId: 'ADM001',
      position: 'مدير النظام',
      positionEn: 'System Administrator'
    },
    {
      id: 5,
      name: 'فاطمة علي حسن',
      nameEn: 'Fatima Ali Hassan',
      email: 'fatima.ali@university.edu',
      phone: '+966501234571',
      role: 'instructor',
      status: 'suspended',
      department: 'الهندسة المدنية',
      departmentEn: 'Civil Engineering',
      lastLogin: new Date('2024-02-05T10:15:00'),
      createdAt: new Date('2021-02-01'),
      avatar: '/images/instructor-avatar2.jpg',
      employeeId: 'EMP002',
      position: 'محاضر',
      positionEn: 'Lecturer'
    }
  ];

  // User statistics
  const userStats = [
    {
      title: t('admin.totalUsers'),
      value: usersData.length,
      subtitle: t('admin.allRoles'),
      icon: <PeopleIcon />,
      color: 'primary'
    },
    {
      title: t('admin.activeUsers'),
      value: usersData.filter(user => user.status === 'active').length,
      subtitle: t('admin.currentlyActive'),
      icon: <CheckCircleIcon />,
      color: 'success'
    },
    {
      title: t('admin.newUsersThisMonth'),
      value: 12,
      subtitle: t('admin.registered'),
      icon: <PersonAddIcon />,
      color: 'info'
    },
    {
      title: t('admin.suspendedUsers'),
      value: usersData.filter(user => user.status === 'suspended').length,
      subtitle: t('admin.requiresAttention'),
      icon: <BlockIcon />,
      color: 'warning'
    }
  ];

  // Role distribution
  const roleDistribution = [
    { role: 'student', count: usersData.filter(u => u.role === 'student').length, icon: <SchoolIcon />, color: 'primary' },
    { role: 'instructor', count: usersData.filter(u => u.role === 'instructor').length, icon: <PersonIcon />, color: 'secondary' },
    { role: 'staff', count: usersData.filter(u => u.role === 'staff').length, icon: <WorkIcon />, color: 'info' },
    { role: 'admin', count: usersData.filter(u => u.role === 'admin').length, icon: <AdminIcon />, color: 'success' }
  ];

  const handleUserDialog = (user = null) => {
    setSelectedUser(user);
    setIsEditMode(!!user);
    setUserDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
    setSelectedUser(null);
    setIsEditMode(false);
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserForMenu(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserForMenu(null);
  };

  const handleSaveUser = async (formData) => {
    setLoading(true);
    try {
      if (isEditMode) {
        console.log('Updating user:', formData);
        // API call to update user
      } else {
        console.log('Creating new user:', formData);
        // API call to create user
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      handleCloseUserDialog();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('admin.confirmDeleteUser'))) {
      console.log('Deleting user:', userId);
      // API call to delete user
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    console.log('Toggling user status:', userId, newStatus);
    // API call to toggle user status
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'instructor':
        return 'primary';
      case 'staff':
        return 'secondary';
      case 'student':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const userFormFields = [
    {
      name: 'name',
      label: t('profile.arabicName'),
      type: 'text',
      required: true,
      gridWidth: 6
    },
    {
      name: 'nameEn',
      label: t('profile.englishName'),
      type: 'text',
      required: true,
      gridWidth: 6
    },
    {
      name: 'email',
      label: t('profile.email'),
      type: 'email',
      required: true,
      gridWidth: 6
    },
    {
      name: 'phone',
      label: t('profile.phone'),
      type: 'tel',
      required: true,
      gridWidth: 6
    },
    {
      name: 'role',
      label: t('admin.role'),
      type: 'select',
      required: true,
      options: [
        { value: 'student', label: t('admin.student') },
        { value: 'instructor', label: t('admin.instructor') },
        { value: 'staff', label: t('admin.staff') },
        { value: 'admin', label: t('admin.admin') }
      ],
      gridWidth: 6
    },
    {
      name: 'department',
      label: t('profile.department'),
      type: 'text',
      required: true,
      gridWidth: 6
    }
  ];

  const filteredUsers = usersData.filter(user => {
    return (!filters.role || user.role === filters.role) &&
           (!filters.status || user.status === filters.status) &&
           (!filters.department || user.department.includes(filters.department));
  });

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`admin-users-tabpanel-${index}`}
        aria-labelledby={`admin-users-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}
        >
          {t('admin.userManagement')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => handleUserDialog()}
        >
          {t('admin.addUser')}
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {userStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatWidget {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Role Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('admin.roleDistribution')}
              </Typography>
              <Grid container spacing={2}>
                {roleDistribution.map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.role}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Avatar sx={{ bgcolor: `${item.color}.main`, mr: 2 }}>
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {item.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(`admin.${item.role}`)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('admin.allUsers')} />
            <Tab label={t('admin.students')} />
            <Tab label={t('admin.instructors')} />
            <Tab label={t('admin.staff')} />
            <Tab label={t('admin.admins')} />
          </Tabs>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('admin.filterByRole')}</InputLabel>
                <Select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  label={t('admin.filterByRole')}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="student">{t('admin.student')}</MenuItem>
                  <MenuItem value="instructor">{t('admin.instructor')}</MenuItem>
                  <MenuItem value="staff">{t('admin.staff')}</MenuItem>
                  <MenuItem value="admin">{t('admin.admin')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('admin.filterByStatus')}</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label={t('admin.filterByStatus')}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="active">{t('admin.active')}</MenuItem>
                  <MenuItem value="suspended">{t('admin.suspended')}</MenuItem>
                  <MenuItem value="inactive">{t('admin.inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('admin.filterByDepartment')}
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilters({ role: '', status: '', department: '' })}
              >
                {t('common.clear')}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Users Table */}
        <TabPanel value={currentTab} index={0}>
          <DataTable
            data={filteredUsers}
            columns={[
              {
                id: 'user',
                label: t('admin.user'),
                render: (value, row) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={row.avatar}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {isRTL ? row.name : row.nameEn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.email}
                      </Typography>
                    </Box>
                  </Box>
                )
              },
              {
                id: 'role',
                label: t('admin.role'),
                render: (value, row) => (
                  <Chip
                    label={t(`admin.${row.role}`)}
                    color={getRoleColor(row.role)}
                    size="small"
                  />
                )
              },
              {
                id: 'department',
                label: t('profile.department'),
                render: (value, row) => isRTL ? row.department : row.departmentEn
              },
              {
                id: 'status',
                label: t('common.status'),
                render: (value, row) => (
                  <Chip
                    label={t(`admin.${row.status}`)}
                    color={getStatusColor(row.status)}
                    size="small"
                  />
                )
              },
              {
                id: 'lastLogin',
                label: t('admin.lastLogin'),
                render: (value, row) => formatDate(row.lastLogin, { 
                  day: 'numeric', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              },
              {
                id: 'actions',
                label: t('common.actions'),
                render: (value, row) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => console.log('View user profile', row.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleUserDialog(row)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, row)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                )
              }
            ]}
            showCheckboxes={true}
            showAdd={false}
            showExport={true}
            emptyMessage={t('admin.noUsers')}
            onAdd={() => handleUserDialog()}
          />
        </TabPanel>

        {/* Role-specific tabs would filter the data accordingly */}
        {[1, 2, 3, 4].map((tabIndex) => {
          const roles = ['student', 'instructor', 'staff', 'admin'];
          const role = roles[tabIndex - 1];
          const roleUsers = filteredUsers.filter(user => user.role === role);
          
          return (
            <TabPanel value={currentTab} index={tabIndex} key={tabIndex}>
              <DataTable
                data={roleUsers}
                columns={[
                  {
                    id: 'user',
                    label: t('admin.user'),
                    render: (value, row) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={row.avatar}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {isRTL ? row.name : row.nameEn}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.email}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  },
                  {
                    id: 'identifier',
                    label: t('admin.identifier'),
                    render: (value, row) => row.studentId || row.employeeId || row.id
                  },
                  {
                    id: 'department',
                    label: t('profile.department'),
                    render: (value, row) => isRTL ? row.department : row.departmentEn
                  },
                  {
                    id: 'status',
                    label: t('common.status'),
                    render: (value, row) => (
                      <Chip
                        label={t(`admin.${row.status}`)}
                        color={getStatusColor(row.status)}
                        size="small"
                      />
                    )
                  },
                  {
                    id: 'lastLogin',
                    label: t('admin.lastLogin'),
                    render: (value, row) => formatDate(row.lastLogin, { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                  },
                  {
                    id: 'actions',
                    label: t('common.actions'),
                    render: (value, row) => (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => console.log('View user profile', row.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleUserDialog(row)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    )
                  }
                ]}
                showCheckboxes={true}
                showAdd={false}
                showExport={true}
                emptyMessage={t(`admin.no${role.charAt(0).toUpperCase() + role.slice(1)}s`)}
              />
            </TabPanel>
          );
        })}
      </Paper>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { 
          console.log('Send notification to user', selectedUserForMenu?.id); 
          handleMenuClose(); 
        }}>
          <SendIcon sx={{ mr: 1 }} />
          {t('admin.sendNotification')}
        </MenuItem>
        <MenuItem onClick={() => { 
          handleToggleUserStatus(selectedUserForMenu?.id, selectedUserForMenu?.status); 
          handleMenuClose(); 
        }}>
          {selectedUserForMenu?.status === 'active' ? <BlockIcon sx={{ mr: 1 }} /> : <CheckCircleIcon sx={{ mr: 1 }} />}
          {selectedUserForMenu?.status === 'active' ? t('admin.suspendUser') : t('admin.activateUser')}
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('Reset password for user', selectedUserForMenu?.id); 
          handleMenuClose(); 
        }}>
          <EditIcon sx={{ mr: 1 }} />
          {t('admin.resetPassword')}
        </MenuItem>
        <MenuItem onClick={() => { 
          handleDeleteUser(selectedUserForMenu?.id); 
          handleMenuClose(); 
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={handleCloseUserDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? t('admin.editUser') : t('admin.addUser')}
        </DialogTitle>
        <DialogContent>
          <DynamicForm
            fields={userFormFields}
            initialValues={selectedUser || {}}
            onSubmit={handleSaveUser}
            submitLabel={isEditMode ? t('common.update') : t('common.create')}
            showSubmitButton={false}
            layout="grid"
            gridColumns={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={() => document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            disabled={loading}
          >
            {isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add user"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleUserDialog()}
      >
        <PersonAddIcon />
      </Fab>
    </Box>
  );
};

export default AdminUsers;