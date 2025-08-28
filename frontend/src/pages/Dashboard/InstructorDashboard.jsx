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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Research as ResearchIcon,
  Announcement as AnnouncementIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  NotificationImportant as UrgentIcon,
  TrendingUp as TrendingUpIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';
import {
  StatWidget,
  ChartWidget,
  ListWidget,
  QuickActionsWidget
} from '../../components/widgets/DashboardWidgets';
import DataTable from '../../components/common/DataTable';

const InstructorDashboard = () => {
  const { t, formatDate, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock instructor data
  const instructorData = {
    id: 'INS789012',
    name: 'د. محمد أحمد الشريف',
    nameEn: 'Dr. Mohammed Ahmed Al-Sharif',
    email: 'mohammed.ahmed@university.edu',
    avatar: '/images/instructor-avatar.jpg',
    department: 'علوم الحاسوب',
    departmentEn: 'Computer Science',
    faculty: 'كلية الهندسة',
    facultyEn: 'Faculty of Engineering',
    position: 'أستاذ مساعد',
    positionEn: 'Assistant Professor',
    office: 'مكتب 205A',
    officeEn: 'Office 205A',
    officeHours: 'الأحد والثلاثاء 10:00-12:00',
    officeHoursEn: 'Sunday & Tuesday 10:00-12:00',
    specialization: 'الذكاء الاصطناعي وتعلم الآلة',
    specializationEn: 'Artificial Intelligence & Machine Learning'
  };

  // Mock statistics
  const stats = [
    {
      title: t('course.courses'),
      value: 4,
      subtitle: t('dashboard.thisMonth'),
      icon: <BookIcon />,
      color: 'primary',
      trend: 'up',
      trendValue: 2
    },
    {
      title: t('student.students'),
      value: 125,
      subtitle: t('dashboard.totalStudents'),
      icon: <PeopleIcon />,
      color: 'success',
      trend: 'up',
      trendValue: 8.5
    },
    {
      title: t('course.assignments'),
      value: 18,
      subtitle: t('dashboard.pending'),
      icon: <AssignmentIcon />,
      color: 'warning'
    },
    {
      title: t('research.publications'),
      value: 12,
      subtitle: t('dashboard.thisYear'),
      icon: <ResearchIcon />,
      color: 'info',
      trend: 'up',
      trendValue: 25
    }
  ];

  // Mock courses
  const courses = [
    {
      id: 1,
      code: 'CS301',
      name: 'البرمجة المتقدمة',
      nameEn: 'Advanced Programming',
      students: 35,
      semester: 'الفصل الأول 2024',
      semesterEn: 'Fall 2024',
      schedule: 'الأحد والثلاثاء 09:00-10:30',
      scheduleEn: 'Sunday & Tuesday 09:00-10:30',
      room: 'Lab 101',
      status: 'active',
      pendingGrades: 8
    },
    {
      id: 2,
      code: 'CS401',
      name: 'الذكاء الاصطناعي',
      nameEn: 'Artificial Intelligence',
      students: 28,
      semester: 'الفصل الأول 2024',
      semesterEn: 'Fall 2024',
      schedule: 'الاثنين والأربعاء 11:00-12:30',
      scheduleEn: 'Monday & Wednesday 11:00-12:30',
      room: 'Room 205',
      status: 'active',
      pendingGrades: 5
    },
    {
      id: 3,
      code: 'CS501',
      name: 'تعلم الآلة',
      nameEn: 'Machine Learning',
      students: 20,
      semester: 'الفصل الأول 2024',
      semesterEn: 'Fall 2024',
      schedule: 'الثلاثاء والخميس 14:00-15:30',
      scheduleEn: 'Tuesday & Thursday 14:00-15:30',
      room: 'Lab 302',
      status: 'active',
      pendingGrades: 3
    },
    {
      id: 4,
      code: 'CS201',
      name: 'تراكيب البيانات',
      nameEn: 'Data Structures',
      students: 42,
      semester: 'الفصل الأول 2024',
      semesterEn: 'Fall 2024',
      schedule: 'السبت والاثنين 10:00-11:30',
      scheduleEn: 'Saturday & Monday 10:00-11:30',
      room: 'Room 150',
      status: 'active',
      pendingGrades: 2
    }
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'grade_submission',
      title: 'تم رفع درجات الاختبار النصفي',
      titleEn: 'Midterm grades uploaded',
      course: 'البرمجة المتقدمة',
      courseEn: 'Advanced Programming',
      date: new Date('2024-01-28T14:30:00'),
      status: 'completed',
      icon: <GradeIcon />
    },
    {
      id: 2,
      type: 'assignment_created',
      title: 'تم إنشاء واجب جديد',
      titleEn: 'New assignment created',
      course: 'الذكاء الاصطناعي',
      courseEn: 'Artificial Intelligence',
      date: new Date('2024-01-27T11:15:00'),
      status: 'active',
      icon: <AssignmentIcon />
    },
    {
      id: 3,
      type: 'announcement',
      title: 'إعلان عن محاضرة إضافية',
      titleEn: 'Announcement for extra lecture',
      course: 'تعلم الآلة',
      courseEn: 'Machine Learning',
      date: new Date('2024-01-26T09:45:00'),
      status: 'published',
      icon: <AnnouncementIcon />
    }
  ];

  // Mock pending tasks
  const pendingTasks = [
    {
      id: 1,
      type: 'grading',
      title: 'تصحيح الواجب الثالث',
      titleEn: 'Grade Assignment 3',
      course: 'البرمجة المتقدمة',
      courseEn: 'Advanced Programming',
      dueDate: new Date('2024-02-02'),
      priority: 'high',
      count: 35
    },
    {
      id: 2,
      type: 'exam_preparation',
      title: 'إعداد الامتحان النهائي',
      titleEn: 'Prepare Final Exam',
      course: 'الذكاء الاصطناعي',
      courseEn: 'Artificial Intelligence',
      dueDate: new Date('2024-02-05'),
      priority: 'medium',
      count: 1
    },
    {
      id: 3,
      type: 'research_review',
      title: 'مراجعة الأوراق البحثية',
      titleEn: 'Review Research Papers',
      course: 'مشروع التخرج',
      courseEn: 'Graduation Project',
      dueDate: new Date('2024-02-08'),
      priority: 'low',
      count: 5
    }
  ];

  // Today's schedule
  const todaySchedule = [
    {
      id: 1,
      course: 'البرمجة المتقدمة',
      courseEn: 'Advanced Programming',
      time: '09:00 - 10:30',
      room: 'Lab 101',
      type: 'lecture',
      students: 35
    },
    {
      id: 2,
      course: 'الذكاء الاصطناعي',
      courseEn: 'Artificial Intelligence',
      time: '11:00 - 12:30',
      room: 'Room 205',
      type: 'lecture',
      students: 28
    },
    {
      id: 3,
      course: 'ساعات مكتبية',
      courseEn: 'Office Hours',
      time: '14:00 - 16:00',
      room: 'Office 205A',
      type: 'office_hours',
      students: null
    }
  ];

  // Quick actions
  const quickActions = [
    {
      label: t('course.addCourse'),
      icon: <BookIcon />,
      onClick: () => console.log('Add course'),
      color: 'primary'
    },
    {
      label: t('course.createAssignment'),
      icon: <AssignmentIcon />,
      onClick: () => console.log('Create assignment'),
      color: 'secondary'
    },
    {
      label: t('student.gradeSubmission'),
      icon: <GradeIcon />,
      onClick: () => console.log('Grade submission'),
      color: 'success'
    },
    {
      label: t('course.courseSchedule'),
      icon: <ScheduleIcon />,
      onClick: () => console.log('View schedule'),
      color: 'info'
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role=\"tabpanel\"
        hidden={value !== index}
        id={`instructor-tabpanel-${index}`}
        aria-labelledby={`instructor-tab-${index}`}
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
              src={instructorData.avatar}
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
              {isRTL ? instructorData.name : instructorData.nameEn}
            </Typography>
            <Typography
              variant=\"body1\"
              color=\"text.secondary\"
              sx={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {instructorData.id} • {isRTL ? instructorData.department : instructorData.departmentEn}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Chip
                label={isRTL ? instructorData.position : instructorData.positionEn}
                color=\"primary\"
                size=\"small\"
              />
              <Chip
                label={isRTL ? instructorData.office : instructorData.officeEn}
                color=\"secondary\"
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

      {/* Quick Actions and Schedule */}
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
                {t('dashboard.todaysClasses')}
              </Typography>
              <List>
                {todaySchedule.map((item, index) => (
                  <ListItem key={item.id} divider={index < todaySchedule.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {item.type === 'office_hours' ? <PersonIcon /> : <BookIcon />}
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
                            {item.room} • {item.time}
                          </Typography>
                          {item.students && (
                            <Typography variant=\"caption\" color=\"primary\">
                              {item.students} {t('student.students')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      label={item.type === 'lecture' ? t('course.lectures') : t('instructor.officeHours')}
                      size=\"small\"
                      color={item.type === 'lecture' ? 'primary' : 'secondary'}
                      variant=\"outlined\"
                    />
                  </ListItem>
                ))}
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
            variant=\"scrollable\"
            scrollButtons=\"auto\"
          >
            <Tab label={t('course.courses')} />
            <Tab label={t('dashboard.pendingTasks')} />
            <Tab label={t('dashboard.recentActivity')} />
            <Tab label={t('research.research')} />
          </Tabs>
        </Box>

        {/* Courses Tab */}
        <TabPanel value={currentTab} index={0}>
          <DataTable
            data={courses}
            columns={[
              {
                id: 'code',
                label: t('course.courseCode'),
                sortable: true
              },
              {
                id: 'name',
                label: t('course.courseName'),
                render: (value, row) => isRTL ? row.name : row.nameEn,
                sortable: true
              },
              {
                id: 'students',
                label: t('student.students'),
                align: 'center',
                sortable: true
              },
              {
                id: 'schedule',
                label: t('course.schedule'),
                render: (value, row) => isRTL ? row.schedule : row.scheduleEn
              },
              {
                id: 'room',
                label: t('common.room'),
                align: 'center'
              },
              {
                id: 'pendingGrades',
                label: t('dashboard.pendingGrades'),
                align: 'center',
                render: (value) => (
                  <Chip
                    label={value}
                    size=\"small\"
                    color={value > 5 ? 'warning' : 'success'}
                    variant={value > 0 ? 'filled' : 'outlined'}
                  />
                )
              }
            ]}
            onView={(row) => console.log('View course', row)}
            onEdit={(row) => console.log('Edit course', row)}
            showCheckboxes={false}
            showAdd={true}
            onAdd={() => console.log('Add new course')}
            emptyMessage={t('course.noCourses')}
          />
        </TabPanel>

        {/* Pending Tasks Tab */}
        <TabPanel value={currentTab} index={1}>
          <ListWidget
            items={pendingTasks}
            renderItem={(item, index) => (
              <ListItem key={item.id} divider={index < pendingTasks.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: item.priority === 'high' ? 'error.main' : 
                             item.priority === 'medium' ? 'warning.main' : 'info.main' 
                  }}>
                    <UrgentIcon />
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
                        {isRTL ? item.course : item.courseEn}
                      </Typography>
                      <Typography variant=\"caption\" color=\"text.secondary\">
                        {t('common.due')}: {formatDate(item.dueDate)}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip
                    label={item.priority}
                    size=\"small\"
                    color={item.priority === 'high' ? 'error' : 
                           item.priority === 'medium' ? 'warning' : 'info'}
                    variant=\"outlined\"
                  />
                  {item.count && (
                    <Typography variant=\"caption\" color=\"text.secondary\">
                      {item.count} {t('common.items')}
                    </Typography>
                  )}
                </Box>
              </ListItem>
            )}
          />
        </TabPanel>

        {/* Recent Activity Tab */}
        <TabPanel value={currentTab} index={2}>
          <ListWidget
            items={recentActivities}
            renderItem={(item, index) => (
              <ListItem key={item.id} divider={index < recentActivities.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
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
                        {isRTL ? item.course : item.courseEn}
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
                  color=\"success\"
                  variant=\"outlined\"
                />
              </ListItem>
            )}
          />
        </TabPanel>

        {/* Research Tab */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StatWidget
                title={t('research.publications')}
                value={12}
                subtitle={t('dashboard.thisYear')}
                icon={<ResearchIcon />}
                color=\"info\"
                variant=\"highlighted\"
                size=\"large\"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatWidget
                title={t('research.researchProjects')}
                value={3}
                subtitle={t('dashboard.active')}
                icon={<AssessmentIcon />}
                color=\"secondary\"
                variant=\"highlighted\"
                size=\"large\"
              />
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant=\"h6\" sx={{ mb: 2 }}>
                    {t('research.recentPublications')}
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

export default InstructorDashboard;