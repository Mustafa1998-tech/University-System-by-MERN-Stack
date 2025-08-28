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
  Tabs,
  Tab,
  Paper,
  Alert,
  Badge,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  AccountBalance as FinanceIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as PerformanceIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assessment as ReportIcon,
  CloudUpload as BackupIcon
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

const AdminDashboard = () => {
  const { t, formatDate, formatNumber, formatCurrency, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock admin data
  const adminData = {
    id: 'ADM123456',
    name: 'أحمد محمد الإداري',
    nameEn: 'Ahmed Mohammed Al-Idari',
    email: 'admin@university.edu',
    avatar: '/images/admin-avatar.jpg',
    role: 'مدير النظام',
    roleEn: 'System Administrator',
    lastLogin: new Date('2024-01-29T08:30:00'),
    department: 'تكنولوجيا المعلومات',
    departmentEn: 'Information Technology'
  };

  // Mock system statistics
  const systemStats = [
    {
      title: t('dashboard.totalStudents'),
      value: 2847,
      subtitle: t('dashboard.active'),
      icon: <SchoolIcon />,
      color: 'primary',
      trend: 'up',
      trendValue: 12.5
    },
    {
      title: t('dashboard.totalInstructors'),
      value: 186,
      subtitle: t('dashboard.facultyMembers'),
      icon: <PeopleIcon />,
      color: 'success',
      trend: 'up',
      trendValue: 3.2
    },
    {
      title: t('dashboard.totalCourses'),
      value: 428,
      subtitle: t('dashboard.thisMonth'),
      icon: <BusinessIcon />,
      color: 'info',
      trend: 'up',
      trendValue: 8.1
    },
    {
      title: t('finance.totalRevenue'),
      value: formatCurrency(1250000),
      subtitle: t('dashboard.thisMonth'),
      icon: <FinanceIcon />,
      color: 'warning',
      trend: 'up',
      trendValue: 15.3
    }
  ];

  // Mock performance metrics
  const performanceMetrics = [
    {
      title: t('dashboard.systemPerformance'),
      value: 95,
      maxValue: 100,
      unit: '%',
      color: 'success',
      variant: 'circular'
    },
    {
      title: t('dashboard.serverUptime'),
      value: 99.8,
      maxValue: 100,
      unit: '%',
      color: 'primary',
      variant: 'linear'
    },
    {
      title: t('dashboard.storageUsage'),
      value: 68,
      maxValue: 100,
      unit: '%',
      color: 'warning',
      variant: 'circular'
    }
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      title: 'تسجيل طالب جديد',
      titleEn: 'New student registration',
      user: 'سارة أحمد محمد',
      userEn: 'Sarah Ahmed Mohammed',
      date: new Date('2024-01-29T14:30:00'),
      status: 'success',
      icon: <PersonIcon />
    },
    {
      id: 2,
      type: 'system_backup',
      title: 'نسخ احتياطي للنظام',
      titleEn: 'System backup completed',
      user: 'النظام',
      userEn: 'System',
      date: new Date('2024-01-29T02:00:00'),
      status: 'success',
      icon: <BackupIcon />
    },
    {
      id: 3,
      type: 'security_alert',
      title: 'محاولة دخول مشبوهة',
      titleEn: 'Suspicious login attempt',
      user: 'نظام الأمان',
      userEn: 'Security System',
      date: new Date('2024-01-28T22:15:00'),
      status: 'warning',
      icon: <SecurityIcon />
    }
  ];

  // Mock system alerts
  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'مساحة التخزين منخفضة',
      titleEn: 'Low storage space',
      message: 'مساحة التخزين المتاحة أقل من 30%',
      messageEn: 'Available storage space is below 30%',
      date: new Date('2024-01-29T10:00:00'),
      severity: 'warning'
    },
    {
      id: 2,
      type: 'info',
      title: 'تحديث النظام متاح',
      titleEn: 'System update available',
      message: 'يتوفر تحديث جديد للنظام (الإصدار 2.1.5)',
      messageEn: 'New system update available (Version 2.1.5)',
      date: new Date('2024-01-28T16:30:00'),
      severity: 'info'
    },
    {
      id: 3,
      type: 'success',
      title: 'النسخ الاحتياطي مكتمل',
      titleEn: 'Backup completed successfully',
      message: 'تم إنجاز النسخ الاحتياطي اليومي بنجاح',
      messageEn: 'Daily backup completed successfully',
      date: new Date('2024-01-29T02:00:00'),
      severity: 'success'
    }
  ];

  // Mock pending approvals
  const pendingApprovals = [
    {
      id: 1,
      type: 'student_application',
      title: 'طلب قبول طالب',
      titleEn: 'Student admission application',
      applicant: 'محمد علي حسن',
      applicantEn: 'Mohammed Ali Hassan',
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      date: new Date('2024-01-25'),
      priority: 'high'
    },
    {
      id: 2,
      type: 'instructor_request',
      title: 'طلب إضافة مقرر جديد',
      titleEn: 'New course addition request',
      applicant: 'د. فاطمة محمد',
      applicantEn: 'Dr. Fatima Mohammed',
      department: 'الرياضيات',
      departmentEn: 'Mathematics',
      date: new Date('2024-01-24'),
      priority: 'medium'
    },
    {
      id: 3,
      type: 'budget_request',
      title: 'طلب اعتماد ميزانية',
      titleEn: 'Budget approval request',
      applicant: 'قسم المختبرات',
      applicantEn: 'Laboratory Department',
      department: 'الهندسة',
      departmentEn: 'Engineering',
      date: new Date('2024-01-23'),
      priority: 'low'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      label: t('admin.users'),
      icon: <PeopleIcon />,
      onClick: () => console.log('Manage users'),
      color: 'primary'
    },
    {
      label: t('admin.settings'),
      icon: <SettingsIcon />,
      onClick: () => console.log('System settings'),
      color: 'secondary'
    },
    {
      label: t('admin.reports'),
      icon: <ReportIcon />,
      onClick: () => console.log('Generate reports'),
      color: 'success'
    },
    {
      label: t('dashboard.backup'),
      icon: <BackupIcon />,
      onClick: () => console.log('System backup'),
      color: 'warning'
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role=\"tabpanel\"
        hidden={value !== index}
        id={`admin-tabpanel-${index}`}
        aria-labelledby={`admin-tab-${index}`}
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
        <Grid container spacing={3} alignItems=\"center\">
          <Grid item>
            <Avatar
              src={adminData.avatar}
              sx={{ width: 80, height: 80 }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography
              variant=\"h4\"
              sx={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}
            >
              {t('dashboard.welcome')}
            </Typography>
            <Typography
              variant=\"h5\"
              color=\"primary\"
              sx={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {isRTL ? adminData.name : adminData.nameEn}
            </Typography>
            <Typography
              variant=\"body1\"
              color=\"text.secondary\"
              sx={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {adminData.id} • {isRTL ? adminData.role : adminData.roleEn}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Chip
                label={`${t('auth.lastLogin')}: ${formatDate(adminData.lastLogin, { hour: '2-digit', minute: '2-digit' })}`}
                color=\"success\"
                size=\"small\"
                variant=\"outlined\"
              />
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Badge badgeContent={systemAlerts.length} color=\"error\">
                <Button
                  variant=\"outlined\"
                  startIcon={<NotificationIcon />}
                  onClick={() => console.log('View notifications')}
                >
                  {t('navigation.notifications')}
                </Button>
              </Badge>
              <Button
                variant=\"contained\"
                startIcon={<SettingsIcon />}
                onClick={() => console.log('System settings')}
              >
                {t('navigation.settings')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {systemAlerts.slice(0, 2).map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.severity}
              sx={{ mb: 1 }}
              onClose={() => console.log('Dismiss alert', alert.id)}
            >
              <Typography variant=\"subtitle2\" sx={{ fontWeight: 600 }}>
                {isRTL ? alert.title : alert.titleEn}
              </Typography>
              <Typography variant=\"body2\">
                {isRTL ? alert.message : alert.messageEn}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatWidget {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={12} md={4} key={index}>
            <ProgressWidget {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions and Recent Activity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <QuickActionsWidget
            title={t('dashboard.shortcuts')}
            actions={quickActions}
            layout=\"grid\"
            columns={1}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant=\"h6\" sx={{ mb: 2, fontWeight: 600 }}>
                {t('dashboard.systemHealth')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckIcon color=\"success\" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant=\"body2\">{t('dashboard.operational')}</Typography>
                    <Typography variant=\"caption\" color=\"text.secondary\">
                      {t('dashboard.allSystems')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PerformanceIcon color=\"primary\" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant=\"body2\">{t('dashboard.performance')}</Typography>
                    <Typography variant=\"caption\" color=\"text.secondary\">
                      95% {t('dashboard.optimal')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <StorageIcon color=\"warning\" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant=\"body2\">{t('dashboard.storage')}</Typography>
                    <Typography variant=\"caption\" color=\"text.secondary\">
                      68% {t('dashboard.used')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SecurityIcon color=\"success\" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant=\"body2\">{t('dashboard.security')}</Typography>
                    <Typography variant=\"caption\" color=\"text.secondary\">
                      {t('dashboard.secure')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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
            variant=\"scrollable\"
            scrollButtons=\"auto\"
          >
            <Tab label={t('dashboard.recentActivity')} />
            <Tab label={t('dashboard.pendingApprovals')} />
            <Tab label={t('dashboard.systemAlerts')} />
            <Tab label={t('admin.reports')} />
          </Tabs>
        </Box>

        {/* Recent Activity Tab */}
        <TabPanel value={currentTab} index={0}>
          <ListWidget
            items={recentActivities}
            renderItem={(item, index) => {
              const getStatusColor = (status) => {
                switch (status) {
                  case 'success': return 'success.main';
                  case 'warning': return 'warning.main';
                  case 'error': return 'error.main';
                  default: return 'info.main';
                }
              };

              return (
                <ListItem key={item.id} divider={index < recentActivities.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStatusColor(item.status) }}>
                      {item.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant=\"subtitle1\" sx={{ fontWeight: 600 }}>
                        {isRTL ? item.title : item.titleEn}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant=\"body2\" color=\"text.secondary\">
                          {t('common.by')}: {isRTL ? item.user : item.userEn}
                        </Typography>
                        <Typography variant=\"caption\" color=\"text.secondary\">
                          {formatDate(item.date, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label={item.status}
                    size=\"small\"
                    color={item.status === 'success' ? 'success' : 
                           item.status === 'warning' ? 'warning' : 'error'}
                    variant=\"outlined\"
                  />
                </ListItem>
              );
            }}
          />
        </TabPanel>

        {/* Pending Approvals Tab */}
        <TabPanel value={currentTab} index={1}>
          <DataTable
            data={pendingApprovals}
            columns={[
              {
                id: 'type',
                label: t('common.type'),
                render: (value, row) => (
                  <Chip
                    label={value}
                    size=\"small\"
                    color={row.priority === 'high' ? 'error' : 
                           row.priority === 'medium' ? 'warning' : 'info'}
                    variant=\"outlined\"
                  />
                )
              },
              {
                id: 'title',
                label: t('common.description'),
                render: (value, row) => isRTL ? row.title : row.titleEn,
                sortable: true
              },
              {
                id: 'applicant',
                label: t('common.applicant'),
                render: (value, row) => isRTL ? row.applicant : row.applicantEn,
                sortable: true
              },
              {
                id: 'department',
                label: t('student.department'),
                render: (value, row) => isRTL ? row.department : row.departmentEn
              },
              {
                id: 'date',
                label: t('common.date'),
                render: (value, row) => formatDate(row.date),
                sortable: true
              },
              {
                id: 'priority',
                label: t('common.priority'),
                align: 'center',
                render: (value) => (
                  <Chip
                    label={value}
                    size=\"small\"
                    color={value === 'high' ? 'error' : 
                           value === 'medium' ? 'warning' : 'info'}
                  />
                )
              }
            ]}
            onView={(row) => console.log('View approval', row)}
            onEdit={(row) => console.log('Process approval', row)}
            showCheckboxes={true}
            showAdd={false}
            emptyMessage={t('dashboard.noPendingApprovals')}
          />
        </TabPanel>

        {/* System Alerts Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {systemAlerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.severity}
                onClose={() => console.log('Dismiss alert', alert.id)}
                action={
                  <Button
                    color=\"inherit\"
                    size=\"small\"
                    onClick={() => console.log('View details', alert.id)}
                  >
                    {t('common.details')}
                  </Button>
                }
              >
                <Typography variant=\"subtitle2\" sx={{ fontWeight: 600 }}>
                  {isRTL ? alert.title : alert.titleEn}
                </Typography>
                <Typography variant=\"body2\">
                  {isRTL ? alert.message : alert.messageEn}
                </Typography>
                <Typography variant=\"caption\" color=\"text.secondary\" sx={{ mt: 1, display: 'block' }}>
                  {formatDate(alert.date, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Alert>
            ))}
          </Box>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StatWidget
                title={t('admin.systemReports')}
                value={24}
                subtitle={t('dashboard.generated')}
                icon={<ReportIcon />}
                color=\"info\"
                variant=\"highlighted\"
                size=\"large\"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatWidget
                title={t('admin.analytics')}
                value={5}
                subtitle={t('dashboard.available')}
                icon: <DashboardIcon />,
                color=\"secondary\"
                variant=\"highlighted\"
                size=\"large\"
              />
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant=\"h6\" sx={{ mb: 2 }}>
                    {t('admin.availableReports')}
                  </Typography>
                  <Typography variant=\"body2\" color=\"text.secondary\">
                    {t('common.comingSoon')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;