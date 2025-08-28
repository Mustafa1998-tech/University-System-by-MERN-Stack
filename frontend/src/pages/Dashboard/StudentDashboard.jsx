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
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Event as EventIcon,
  Notifications as NotificationIcon,
  AccountBalance as FinanceIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Book as BookIcon,
  Person as PersonIcon
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

const StudentDashboard = () => {
  const { t, formatDate, formatCurrency, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock student data - in real app, this would come from API
  const studentData = {
    id: 'STU123456',
    name: 'أحمد محمد علي',
    nameEn: 'Ahmed Mohammed Ali',
    email: 'ahmed.mohammed@university.edu',
    avatar: '/images/student-avatar.jpg',
    department: 'علوم الحاسوب',
    departmentEn: 'Computer Science',
    faculty: 'كلية الهندسة',
    facultyEn: 'Faculty of Engineering',
    currentSemester: 'الفصل الأول 2024-2025',
    currentSemesterEn: 'Fall 2024-2025',
    level: 'السنة الثالثة',
    levelEn: 'Third Year',
    gpa: 3.75,
    completedCredits: 89,
    totalCredits: 120,
    classification: 'ممتاز',
    classificationEn: 'Excellent'
  };

  // Mock statistics
  const stats = [
    {
      title: t('student.gpa'),
      value: studentData.gpa.toFixed(2),
      subtitle: t('student.cumulativeGPA'),
      icon: <GradeIcon />,
      color: 'success',
      trend: 'up',
      trendValue: 5.2
    },
    {
      title: t('student.credits'),
      value: `${studentData.completedCredits}/${studentData.totalCredits}`,
      subtitle: t('student.creditsEarned'),
      icon: <SchoolIcon />,
      color: 'primary',
      trend: 'up',
      trendValue: 12.5
    },
    {
      title: t('course.courses'),
      value: 6,
      subtitle: t('dashboard.thisMonth'),
      icon: <BookIcon />,
      color: 'info'
    },
    {
      title: t('finance.balance'),
      value: formatCurrency(2500),
      subtitle: t('finance.outstandingBalance'),
      icon: <FinanceIcon />,
      color: 'warning'
    }
  ];

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'امتحان البرمجة المتقدمة',
      titleEn: 'Advanced Programming Exam',
      date: new Date('2024-02-15T09:00:00'),
      type: 'exam',
      status: 'upcoming',
      statusColor: 'warning'
    },
    {
      id: 2,
      title: 'تسليم مشروع قواعد البيانات',
      titleEn: 'Database Project Submission',
      date: new Date('2024-02-20T23:59:00'),
      type: 'assignment',
      status: 'due_soon',
      statusColor: 'error'
    },
    {
      id: 3,
      title: 'محاضرة الذكاء الاصطناعي',
      titleEn: 'AI Lecture',
      date: new Date('2024-02-12T10:00:00'),
      type: 'lecture',
      status: 'scheduled',
      statusColor: 'primary'
    }
  ];

  // Mock recent grades
  const recentGrades = [
    {
      id: 1,
      course: 'البرمجة الشيئية',
      courseEn: 'Object-Oriented Programming',
      assignment: 'الاختبار النصفي',
      assignmentEn: 'Midterm Exam',
      grade: 'A',
      points: 95,
      date: new Date('2024-01-25')
    },
    {
      id: 2,
      course: 'تراكيب البيانات',
      courseEn: 'Data Structures',
      assignment: 'مشروع عملي',
      assignmentEn: 'Practical Project',
      grade: 'A-',
      points: 88,
      date: new Date('2024-01-20')
    },
    {
      id: 3,
      course: 'الرياضيات المتقدمة',
      courseEn: 'Advanced Mathematics',
      assignment: 'الواجب الثالث',
      assignmentEn: 'Assignment 3',
      grade: 'B+',
      points: 85,
      date: new Date('2024-01-18')
    }
  ];

  // Today's schedule
  const todaySchedule = [
    {
      id: 1,
      course: 'البرمجة المتقدمة',
      courseEn: 'Advanced Programming',
      instructor: 'د. محمد أحمد',
      instructorEn: 'Dr. Mohammed Ahmed',
      time: '09:00 - 10:30',
      room: 'Lab 101',
      type: 'lecture'
    },
    {
      id: 2,
      course: 'قواعد البيانات',
      courseEn: 'Database Systems',
      instructor: 'د. فاطمة علي',
      instructorEn: 'Dr. Fatima Ali',
      time: '11:00 - 12:30',
      room: 'Room 205',
      type: 'lecture'
    },
    {
      id: 3,
      course: 'الذكاء الاصطناعي',
      courseEn: 'Artificial Intelligence',
      instructor: 'د. سامر محمود',
      instructorEn: 'Dr. Samer Mahmoud',
      time: '14:00 - 15:30',
      room: 'Lab 302',
      type: 'lab'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      label: t('student.transcriptRequest'),
      icon: <DownloadIcon />,
      onClick: () => console.log('Request transcript'),
      color: 'primary'
    },
    {
      label: t('student.certificateRequest'),
      icon: <SchoolIcon />,
      onClick: () => console.log('Request certificate'),
      color: 'secondary'
    },
    {
      label: t('finance.makePayment'),
      icon: <FinanceIcon />,
      onClick: () => console.log('Make payment'),
      color: 'success'
    },
    {
      label: t('course.courseSchedule'),
      icon: <CalendarIcon />,
      onClick: () => console.log('View schedule'),
      color: 'info'
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role=\"tabpanel\"
        hidden={value !== index}
        id={`dashboard-tabpanel-${index}`}
        aria-labelledby={`dashboard-tab-${index}`}
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
              src={studentData.avatar}
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
              {isRTL ? studentData.name : studentData.nameEn}
            </Typography>
            <Typography
              variant=\"body1\"
              color=\"text.secondary\"
              sx={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {studentData.id} • {isRTL ? studentData.department : studentData.departmentEn}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Chip
                label={isRTL ? studentData.level : studentData.levelEn}
                color=\"primary\"
                size=\"small\"
              />
              <Chip
                label={isRTL ? studentData.classification : studentData.classificationEn}
                color=\"success\"
                size=\"small\"
              />
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant=\"contained\"
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

      {/* Academic Progress */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <ProgressWidget
            title={t('student.academicProgress')}
            subtitle={`${studentData.completedCredits} ${t('common.of')} ${studentData.totalCredits} ${t('student.credits')}`}
            value={studentData.completedCredits}
            maxValue={studentData.totalCredits}
            variant=\"circular\"
            color=\"primary\"
            size=\"large\"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatWidget
            title={t('student.gpa')}
            value={studentData.gpa.toFixed(2)}
            subtitle={`${t('common.outOf')} 4.0`}
            icon={<TrendingUpIcon />}
            color=\"success\"
            variant=\"highlighted\"
            size=\"large\"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionsWidget
            title={t('dashboard.shortcuts')}
            actions={quickActions}
            layout=\"list\"
          />
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
            <Tab label={t('dashboard.todaysClasses')} />
            <Tab label={t('dashboard.recentActivity')} />
            <Tab label={t('dashboard.upcomingEvents')} />
            <Tab label={t('student.grades')} />
          </Tabs>
        </Box>

        {/* Today's Classes Tab */}
        <TabPanel value={currentTab} index={0}>
          <ListWidget
            items={todaySchedule}
            renderItem={(item, index) => (
              <ListItem key={item.id} divider={index < todaySchedule.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BookIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant=\"subtitle1\" sx={{ fontWeight: 600 }}>
                      {isRTL ? item.course : item.courseEn}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant=\"body2\" color=\"text.secondary\">
                        {isRTL ? item.instructor : item.instructorEn} • {item.room}
                      </Typography>
                      <Typography variant=\"caption\" color=\"primary\">
                        {item.time}
                      </Typography>
                    </Box>
                  }
                />
                <Chip
                  label={item.type === 'lecture' ? t('course.lectures') : t('course.labs')}
                  size=\"small\"
                  color={item.type === 'lecture' ? 'primary' : 'secondary'}
                  variant=\"outlined\"
                />
              </ListItem>
            )}
          />
        </TabPanel>

        {/* Recent Activity Tab */}
        <TabPanel value={currentTab} index={1}>
          <ListWidget
            items={recentGrades}
            renderItem={(item, index) => (
              <ListItem key={item.id} divider={index < recentGrades.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <GradeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant=\"subtitle1\" sx={{ fontWeight: 600 }}>
                      {isRTL ? item.course : item.courseEn}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant=\"body2\" color=\"text.secondary\">
                        {isRTL ? item.assignment : item.assignmentEn}
                      </Typography>
                      <Typography variant=\"caption\" color=\"text.secondary\">
                        {formatDate(item.date)}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip
                    label={item.grade}
                    size=\"small\"
                    color=\"success\"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant=\"caption\" color=\"text.secondary\">
                    {item.points}/100
                  </Typography>
                </Box>
              </ListItem>
            )}
          />
        </TabPanel>

        {/* Upcoming Events Tab */}
        <TabPanel value={currentTab} index={2}>
          <ListWidget
            items={upcomingEvents}
            renderItem={(item, index) => (
              <ListItem key={item.id} divider={index < upcomingEvents.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <EventIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant=\"subtitle1\" sx={{ fontWeight: 600 }}>
                      {isRTL ? item.title : item.titleEn}
                    </Typography>
                  }
                  secondary={
                    <Typography variant=\"body2\" color=\"text.secondary\">
                      {formatDate(item.date, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  }
                />
                <Chip
                  label={item.status}
                  size=\"small\"
                  color={item.statusColor}
                  variant=\"outlined\"
                />
              </ListItem>
            )}
          />
        </TabPanel>

        {/* Grades Tab */}
        <TabPanel value={currentTab} index={3}>
          <DataTable
            data={recentGrades}
            columns={[
              {
                id: 'course',
                label: t('course.course'),
                render: (value, row) => isRTL ? row.course : row.courseEn
              },
              {
                id: 'assignment',
                label: t('course.assignments'),
                render: (value, row) => isRTL ? row.assignment : row.assignmentEn
              },
              {
                id: 'grade',
                label: t('student.grades'),
                render: (value, row) => (
                  <Chip
                    label={row.grade}
                    size=\"small\"
                    color=\"success\"
                    sx={{ fontWeight: 'bold' }}
                  />
                )
              },
              {
                id: 'points',
                label: t('common.points'),
                render: (value, row) => `${row.points}/100`
              },
              {
                id: 'date',
                label: t('common.date'),
                render: (value, row) => formatDate(row.date)
              }
            ]}
            showCheckboxes={false}
            showAdd={false}
            showExport={true}
            showSearch={false}
            showFilters={false}
            emptyMessage={t('student.noGrades')}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StudentDashboard;