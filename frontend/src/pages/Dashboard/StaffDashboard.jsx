import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationIcon,
  AccountBalance as FinanceIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';
import {
  StatWidget,
  ChartWidget,
  ListWidget,
  ProgressWidget,
  QuickActionsWidget
} from '../../components/widgets/DashboardWidgets';
import DataTable from '../../components/common/DataTable';

const StaffDashboard = () => {
  const { t, formatDate, formatCurrency, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock staff data
  const staffData = {
    id: 'STF789012',
    name: 'سارة أحمد محمد',
    nameEn: 'Sara Ahmed Mohammed',
    email: 'sara.ahmed@university.edu',
    avatar: '/images/staff-avatar.jpg',
    department: 'شؤون الطلاب',
    departmentEn: 'Student Affairs',
    position: 'منسق شؤون الطلاب',
    positionEn: 'Student Affairs Coordinator',
    workingHours: '08:00 - 16:00',
    joinDate: new Date('2020-09-01')
  };

  // Mock statistics
  const stats = [
    {
      title: t('staff.totalStudents'),
      value: 2847,
      subtitle: t('dashboard.totalEnrolled'),
      icon: <PeopleIcon />,
      color: 'primary',
      trend: 'up',
      trendValue: 12.5
    },
    {
      title: t('staff.pendingApplications'),
      value: 45,
      subtitle: t('staff.requiresAttention'),
      icon: <AssignmentIcon />,
      color: 'warning',
      trend: 'down',
      trendValue: 8.3
    },
    {
      title: t('staff.activeInstructors'),
      value: 186,
      subtitle: t('dashboard.thisMonth'),
      icon: <SchoolIcon />,
      color: 'success',
      trend: 'up',
      trendValue: 3.2
    },
    {
      title: t('finance.totalRevenue'),
      value: formatCurrency(1250000),
      subtitle: t('dashboard.thisMonth'),
      icon: <FinanceIcon />,
      color: 'info',
      trend: 'up',
      trendValue: 15.7
    }
  ];

  // Mock pending tasks
  const pendingTasks = [
    {
      id: 1,
      title: 'مراجعة طلبات التسجيل الجديدة',
      titleEn: 'Review New Registration Applications',
      priority: 'high',
      dueDate: new Date('2024-02-15'),
      department: 'القبول والتسجيل',
      departmentEn: 'Admissions',
      count: 23
    },
    {
      id: 2,
      title: 'تحديث بيانات الطلاب المتخرجين',
      titleEn: 'Update Graduate Student Records',
      priority: 'medium',
      dueDate: new Date('2024-02-20'),
      department: 'السجلات الأكاديمية',
      departmentEn: 'Academic Records',
      count: 15
    },
    {
      id: 3,
      title: 'إعداد تقرير الحضور الشهري',
      titleEn: 'Prepare Monthly Attendance Report',
      priority: 'medium',
      dueDate: new Date('2024-02-25'),
      department: 'شؤون الطلاب',
      departmentEn: 'Student Affairs',
      count: 1
    },
    {
      id: 4,
      title: 'مراجعة طلبات المنح الدراسية',
      titleEn: 'Review Scholarship Applications',
      priority: 'low',
      dueDate: new Date('2024-03-01'),
      department: 'الشؤون المالية',
      departmentEn: 'Financial Affairs',
      count: 8
    }
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'تم الموافقة على طلب تحويل الطالب أحمد محمد',
      actionEn: 'Approved transfer request for Ahmed Mohammed',
      timestamp: new Date('2024-02-10T14:30:00'),
      type: 'approval',
      status: 'completed'
    },
    {
      id: 2,
      action: 'تم إنشاء تقرير الدرجات للفصل الحالي',
      actionEn: 'Generated grades report for current semester',
      timestamp: new Date('2024-02-10T11:15:00'),
      type: 'report',
      status: 'completed'
    },
    {
      id: 3,
      action: 'تم تحديث بيانات 15 طالب في النظام',
      actionEn: 'Updated records for 15 students in system',
      timestamp: new Date('2024-02-09T16:45:00'),
      type: 'update',
      status: 'completed'
    },
    {
      id: 4,
      action: 'تم إرسال إشعارات دفع الرسوم لـ 120 طالب',
      actionEn: 'Sent fee payment notifications to 120 students',
      timestamp: new Date('2024-02-09T10:00:00'),
      type: 'notification',
      status: 'completed'
    }
  ];

  // Mock department overview
  const departmentOverview = [
    {
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      students: 450,
      instructors: 25,
      pendingApplications: 12,
      status: 'active'
    },
    {
      department: 'الهندسة المدنية',
      departmentEn: 'Civil Engineering',
      students: 380,
      instructors: 20,
      pendingApplications: 8,
      status: 'active'
    },
    {
      department: 'إدارة الأعمال',
      departmentEn: 'Business Administration',
      students: 520,
      instructors: 28,
      pendingApplications: 15,
      status: 'active'
    },
    {
      department: 'الطب',
      departmentEn: 'Medicine',
      students: 320,
      instructors: 35,
      pendingApplications: 5,
      status: 'active'
    }
  ];

  // Quick actions for staff
  const quickActions = [
    {
      label: t('staff.processApplications'),
      icon: <AssignmentIcon />,
      onClick: () => console.log('Process applications'),
      color: 'primary'
    },
    {
      label: t('staff.generateReports'),
      icon: <TrendingUpIcon />,
      onClick: () => console.log('Generate reports'),
      color: 'secondary'
    },
    {
      label: t('staff.sendNotifications'),
      icon: <NotificationIcon />,
      onClick: () => console.log('Send notifications'),
      color: 'info'
    },
    {
      label: t('staff.manageStudents'),
      icon: <PeopleIcon />,
      onClick: () => console.log('Manage students'),
      color: 'success'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`staff-tabpanel-${index}`}
        aria-labelledby={`staff-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={staffData.avatar}
              sx={{ width: 80, height: 80 }}
            >
              <WorkIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}
            >
              {t('dashboard.welcome')}
            </Typography>
            <Typography
              variant="h5"
              color="primary"
              sx={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {isRTL ? staffData.name : staffData.nameEn}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {staffData.id} • {isRTL ? staffData.position : staffData.positionEn}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Chip
                label={isRTL ? staffData.department : staffData.departmentEn}
                color="primary"
                size="small"
              />
              <Chip
                label={staffData.workingHours}
                color="info"
                size="small"
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<PersonIcon />}
              onClick={() => console.log('View profile')}
            >
              {t('navigation.profile')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatWidget {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions and Alerts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small">
                {t('common.viewAll')}
              </Button>
            }
          >
            {t('staff.pendingTasksAlert', { count: pendingTasks.length })}
          </Alert>
          <QuickActionsWidget
            title={t('dashboard.shortcuts')}
            actions={quickActions}
            layout="grid"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('staff.workloadSummary')}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={t('staff.pendingApplications')}
                    secondary={`${pendingTasks.filter(task => task.priority === 'high').length} ${t('common.urgent')}`}
                  />
                  <Chip
                    label={pendingTasks.reduce((sum, task) => sum + task.count, 0)}
                    color="warning"
                    size="small"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t('staff.completedToday')}
                    secondary={t('staff.allDepartments')}
                  />
                  <Chip
                    label="12"
                    color="success"
                    size="small"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t('staff.scheduledTasks')}
                    secondary={t('dashboard.tomorrow')}
                  />
                  <Chip
                    label="8"
                    color="info"
                    size="small"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('staff.pendingTasks')} />
            <Tab label={t('staff.recentActivity')} />
            <Tab label={t('staff.departmentOverview')} />
            <Tab label={t('staff.systemHealth')} />
          </Tabs>
        </Box>

        {/* Pending Tasks Tab */}
        <TabPanel value={currentTab} index={0}>
          <DataTable
            data={pendingTasks}
            columns={[
              {
                id: 'title',
                label: t('common.task'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {isRTL ? row.title : row.titleEn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isRTL ? row.department : row.departmentEn}
                    </Typography>
                  </Box>
                )
              },
              {
                id: 'priority',
                label: t('common.priority'),
                render: (value, row) => (
                  <Chip
                    label={t(`common.${row.priority}`)}
                    color={getPriorityColor(row.priority)}
                    size="small"
                  />
                )
              },
              {
                id: 'count',
                label: t('common.count'),
                render: (value, row) => (
                  <Chip
                    label={row.count}
                    color="default"
                    size="small"
                    variant="outlined"
                  />
                )
              },
              {
                id: 'dueDate',
                label: t('common.dueDate'),
                render: (value, row) => formatDate(row.dueDate)
              },
              {
                id: 'actions',
                label: t('common.actions'),
                render: (value, row) => (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => console.log('Process task', row.id)}
                  >
                    {t('common.process')}
                  </Button>
                )
              }
            ]}
            showCheckboxes={true}
            showAdd={false}
            showExport={true}
            emptyMessage={t('staff.noPendingTasks')}
          />
        </TabPanel>

        {/* Recent Activity Tab */}
        <TabPanel value={currentTab} index={1}>
          <ListWidget
            items={recentActivities}
            renderItem={(item, index) => (
              <ListItem key={item.id} divider={index < recentActivities.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {isRTL ? item.action : item.actionEn}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.timestamp, { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Typography>
                  }
                />
                <Chip
                  label={t(`common.${item.status}`)}
                  color="success"
                  size="small"
                  variant="outlined"
                />
              </ListItem>
            )}
          />
        </TabPanel>

        {/* Department Overview Tab */}
        <TabPanel value={currentTab} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.department')}</TableCell>
                  <TableCell align="center">{t('staff.totalStudents')}</TableCell>
                  <TableCell align="center">{t('staff.activeInstructors')}</TableCell>
                  <TableCell align="center">{t('staff.pendingApplications')}</TableCell>
                  <TableCell align="center">{t('common.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departmentOverview.map((dept) => (
                  <TableRow key={dept.department}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {isRTL ? dept.department : dept.departmentEn}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={dept.students} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={dept.instructors} color="secondary" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={dept.pendingApplications} 
                        color={dept.pendingApplications > 10 ? "warning" : "success"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={t(`common.${dept.status}`)}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* System Health Tab */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('staff.systemStatus')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <CheckCircleIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={t('staff.databaseConnection')}
                        secondary={t('common.operational')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <CheckCircleIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={t('staff.emailService')}
                        secondary={t('common.operational')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={t('staff.backupService')}
                        secondary={t('staff.scheduledMaintenance')}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('staff.performanceMetrics')}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('staff.responseTime')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={85} color="success" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        85ms
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('staff.systemLoad')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={65} color="warning" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        65%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('staff.activeUsers')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={75} color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        1,247
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StaffDashboard;