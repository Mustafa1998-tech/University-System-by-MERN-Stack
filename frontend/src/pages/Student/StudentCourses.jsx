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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  Book as BookIcon,
  Assignment as MaterialIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';
import DataTable from '../../components/common/DataTable';
import {
  StatWidget,
  ListWidget,
  ProgressWidget
} from '../../components/widgets/DashboardWidgets';

const StudentCourses = () => {
  const { t, formatDate, formatTime, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock enrolled courses data
  const enrolledCourses = [
    {
      id: 'CS301',
      code: 'CS301',
      name: 'البرمجة المتقدمة',
      nameEn: 'Advanced Programming',
      credits: 3,
      instructor: 'د. محمد أحمد',
      instructorEn: 'Dr. Mohammed Ahmed',
      semester: 'الفصل الأول 2024-2025',
      semesterEn: 'Fall 2024-2025',
      schedule: [
        { day: 'الأحد', dayEn: 'Sunday', time: '09:00-10:30', room: 'Lab 101' },
        { day: 'الثلاثاء', dayEn: 'Tuesday', time: '09:00-10:30', room: 'Lab 101' }
      ],
      progress: 75,
      grade: 'A-',
      status: 'active',
      description: 'مقرر يتناول مفاهيم البرمجة المتقدمة باستخدام لغات البرمجة الحديثة',
      descriptionEn: 'Course covering advanced programming concepts using modern programming languages',
      assignments: [
        { id: 1, title: 'مشروع عملي', titleEn: 'Practical Project', dueDate: new Date('2024-02-20'), status: 'pending' },
        { id: 2, title: 'اختبار قصير', titleEn: 'Quiz', dueDate: new Date('2024-02-15'), status: 'completed' }
      ],
      materials: [
        { id: 1, title: 'محاضرة 1 - مقدمة', titleEn: 'Lecture 1 - Introduction', type: 'pdf', size: '2.5 MB' },
        { id: 2, title: 'أمثلة عملية', titleEn: 'Practical Examples', type: 'zip', size: '15.2 MB' }
      ]
    },
    {
      id: 'CS302',
      code: 'CS302',
      name: 'قواعد البيانات',
      nameEn: 'Database Systems',
      credits: 3,
      instructor: 'د. فاطمة علي',
      instructorEn: 'Dr. Fatima Ali',
      semester: 'الفصل الأول 2024-2025',
      semesterEn: 'Fall 2024-2025',
      schedule: [
        { day: 'الإثنين', dayEn: 'Monday', time: '11:00-12:30', room: 'Room 205' },
        { day: 'الأربعاء', dayEn: 'Wednesday', time: '11:00-12:30', room: 'Room 205' }
      ],
      progress: 60,
      grade: 'B+',
      status: 'active',
      description: 'مقرر يغطي أساسيات قواعد البيانات وتصميمها وإدارتها',
      descriptionEn: 'Course covering database fundamentals, design, and management',
      assignments: [
        { id: 3, title: 'تصميم قاعدة بيانات', titleEn: 'Database Design', dueDate: new Date('2024-02-25'), status: 'pending' }
      ],
      materials: [
        { id: 3, title: 'محاضرة 1 - أساسيات قواعد البيانات', titleEn: 'Lecture 1 - Database Fundamentals', type: 'pdf', size: '3.1 MB' }
      ]
    },
    {
      id: 'CS303',
      code: 'CS303',
      name: 'الذكاء الاصطناعي',
      nameEn: 'Artificial Intelligence',
      credits: 3,
      instructor: 'د. سامر محمود',
      instructorEn: 'Dr. Samer Mahmoud',
      semester: 'الفصل الأول 2024-2025',
      semesterEn: 'Fall 2024-2025',
      schedule: [
        { day: 'الثلاثاء', dayEn: 'Tuesday', time: '14:00-15:30', room: 'Lab 302' },
        { day: 'الخميس', dayEn: 'Thursday', time: '14:00-15:30', room: 'Lab 302' }
      ],
      progress: 85,
      grade: 'A',
      status: 'active',
      description: 'مقرر يتناول مفاهيم الذكاء الاصطناعي وتطبيقاته العملية',
      descriptionEn: 'Course covering AI concepts and practical applications',
      assignments: [
        { id: 4, title: 'مشروع التعلم الآلي', titleEn: 'Machine Learning Project', dueDate: new Date('2024-03-01'), status: 'pending' }
      ],
      materials: [
        { id: 4, title: 'محاضرة 1 - مقدمة في الذكاء الاصطناعي', titleEn: 'Lecture 1 - Introduction to AI', type: 'pdf', size: '4.2 MB' }
      ]
    },
    {
      id: 'MATH201',
      code: 'MATH201',
      name: 'الرياضيات المتقدمة',
      nameEn: 'Advanced Mathematics',
      credits: 3,
      instructor: 'د. نور الدين حسن',
      instructorEn: 'Dr. Nour Al-Din Hassan',
      semester: 'الفصل الأول 2024-2025',
      semesterEn: 'Fall 2024-2025',
      schedule: [
        { day: 'الأحد', dayEn: 'Sunday', time: '13:00-14:30', room: 'Room 103' },
        { day: 'الأربعاء', dayEn: 'Wednesday', time: '13:00-14:30', room: 'Room 103' }
      ],
      progress: 70,
      grade: 'B+',
      status: 'active',
      description: 'مقرر يغطي المفاهيم الرياضية المتقدمة المطلوبة لعلوم الحاسوب',
      descriptionEn: 'Course covering advanced mathematical concepts required for computer science',
      assignments: [
        { id: 5, title: 'واجب رقم 3', titleEn: 'Assignment 3', dueDate: new Date('2024-02-18'), status: 'completed' }
      ],
      materials: [
        { id: 5, title: 'ملاحظات المحاضرة', titleEn: 'Lecture Notes', type: 'pdf', size: '1.8 MB' }
      ]
    }
  ];

  // Course statistics
  const courseStats = [
    {
      title: t('course.totalCourses'),
      value: enrolledCourses.length,
      subtitle: t('course.thissemester'),
      icon: <SchoolIcon />,
      color: 'primary'
    },
    {
      title: t('course.totalCredits'),
      value: enrolledCourses.reduce((sum, course) => sum + course.credits, 0),
      subtitle: t('course.enrolled'),
      icon: <BookIcon />,
      color: 'secondary'
    },
    {
      title: t('course.averageProgress'),
      value: `${Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)}%`,
      subtitle: t('course.completion'),
      icon: <AssignmentIcon />,
      color: 'success'
    },
    {
      title: t('course.upcomingAssignments'),
      value: enrolledCourses.reduce((sum, course) => sum + course.assignments.filter(a => a.status === 'pending').length, 0),
      subtitle: t('course.thisTwoWeeks'),
      icon: <AssignmentIcon />,
      color: 'warning'
    }
  ];

  // Today's schedule
  const todaySchedule = enrolledCourses.flatMap(course =>
    course.schedule.map(schedule => ({
      ...schedule,
      course: course.name,
      courseEn: course.nameEn,
      courseCode: course.code,
      instructor: course.instructor,
      instructorEn: course.instructorEn
    }))
  ).slice(0, 3); // Show only first 3 for demo

  const handleCourseDetails = (course) => {
    setSelectedCourse(course);
    setCourseDetailsOpen(true);
  };

  const handleCloseCourseDetails = () => {
    setCourseDetailsOpen(false);
    setSelectedCourse(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`courses-tabpanel-${index}`}
        aria-labelledby={`courses-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', mb: 3, textAlign: isRTL ? 'right' : 'left' }}
      >
        {t('course.myCourses')}
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {courseStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatWidget {...stat} />
          </Grid>
        ))}
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
            <Tab label={t('course.enrolledCourses')} />
            <Tab label={t('course.schedule')} />
            <Tab label={t('course.assignments')} />
            <Tab label={t('course.materials')} />
          </Tabs>
        </Box>

        {/* Enrolled Courses Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {enrolledCourses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                        {isRTL ? course.name : course.nameEn}
                      </Typography>
                      <Chip
                        label={course.code}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {isRTL ? course.description : course.descriptionEn}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('course.instructor')}
                      </Typography>
                      <Typography variant="body2">
                        {isRTL ? course.instructor : course.instructorEn}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('course.credits')}
                      </Typography>
                      <Typography variant="body2">
                        {course.credits} {t('course.creditHours')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        {t('course.progress')}: {course.progress}%
                      </Typography>
                      <ProgressWidget
                        value={course.progress}
                        maxValue={100}
                        variant="linear"
                        color="primary"
                        showLabel={false}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={course.grade}
                        color="success"
                        size="small"
                      />
                      <Chip
                        label={t(`course.${course.status}`)}
                        color={getStatusColor(course.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<InfoIcon />}
                      onClick={() => handleCourseDetails(course)}
                    >
                      {t('course.viewDetails')}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={currentTab} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('course.scheduleNote')}
          </Alert>
          
          <DataTable
            data={todaySchedule}
            columns={[
              {
                id: 'course',
                label: t('course.course'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {isRTL ? row.course : row.courseEn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.courseCode}
                    </Typography>
                  </Box>
                )
              },
              {
                id: 'day',
                label: t('course.day'),
                render: (value, row) => isRTL ? row.day : row.dayEn
              },
              {
                id: 'time',
                label: t('course.time'),
                render: (value, row) => row.time
              },
              {
                id: 'room',
                label: t('course.room'),
                render: (value, row) => row.room
              },
              {
                id: 'instructor',
                label: t('course.instructor'),
                render: (value, row) => isRTL ? row.instructor : row.instructorEn
              }
            ]}
            showCheckboxes={false}
            showAdd={false}
            showExport={true}
            emptyMessage={t('course.noSchedule')}
          />
        </TabPanel>

        {/* Assignments Tab */}
        <TabPanel value={currentTab} index={2}>
          <DataTable
            data={enrolledCourses.flatMap(course => 
              course.assignments.map(assignment => ({
                ...assignment,
                courseName: isRTL ? course.name : course.nameEn,
                courseCode: course.code
              }))
            )}
            columns={[
              {
                id: 'title',
                label: t('course.assignment'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {isRTL ? row.title : row.titleEn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.courseName} ({row.courseCode})
                    </Typography>
                  </Box>
                )
              },
              {
                id: 'dueDate',
                label: t('course.dueDate'),
                render: (value, row) => formatDate(row.dueDate)
              },
              {
                id: 'status',
                label: t('common.status'),
                render: (value, row) => (
                  <Chip
                    label={t(`course.${row.status}`)}
                    color={getStatusColor(row.status)}
                    size="small"
                  />
                )
              },
              {
                id: 'actions',
                label: t('common.actions'),
                render: (value, row) => (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => console.log('View assignment', row.id)}
                  >
                    {t('common.view')}
                  </Button>
                )
              }
            ]}
            showCheckboxes={false}
            showAdd={false}
            showExport={false}
            emptyMessage={t('course.noAssignments')}
          />
        </TabPanel>

        {/* Materials Tab */}
        <TabPanel value={currentTab} index={3}>
          <DataTable
            data={enrolledCourses.flatMap(course => 
              course.materials.map(material => ({
                ...material,
                courseName: isRTL ? course.name : course.nameEn,
                courseCode: course.code
              }))
            )}
            columns={[
              {
                id: 'title',
                label: t('course.material'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {isRTL ? row.title : row.titleEn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.courseName} ({row.courseCode})
                    </Typography>
                  </Box>
                )
              },
              {
                id: 'type',
                label: t('course.type'),
                render: (value, row) => (
                  <Chip
                    label={row.type.toUpperCase()}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                )
              },
              {
                id: 'size',
                label: t('course.size'),
                render: (value, row) => row.size
              },
              {
                id: 'actions',
                label: t('common.actions'),
                render: (value, row) => (
                  <IconButton
                    color="primary"
                    onClick={() => console.log('Download material', row.id)}
                  >
                    <DownloadIcon />
                  </IconButton>
                )
              }
            ]}
            showCheckboxes={false}
            showAdd={false}
            showExport={false}
            emptyMessage={t('course.noMaterials')}
          />
        </TabPanel>
      </Paper>

      {/* Course Details Dialog */}
      <Dialog
        open={courseDetailsOpen}
        onClose={handleCloseCourseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {isRTL ? selectedCourse.name : selectedCourse.nameEn}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCourse.code} • {isRTL ? selectedCourse.instructor : selectedCourse.instructorEn}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('course.description')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {isRTL ? selectedCourse.description : selectedCourse.descriptionEn}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    {t('course.schedule')}
                  </Typography>
                  <List dense>
                    {selectedCourse.schedule.map((schedule, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <ScheduleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={isRTL ? schedule.day : schedule.dayEn}
                          secondary={`${schedule.time} - ${schedule.room}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('course.courseInfo')}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={t('course.credits')}
                        secondary={`${selectedCourse.credits} ${t('course.creditHours')}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('course.currentGrade')}
                        secondary={selectedCourse.grade}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('course.progress')}
                        secondary={`${selectedCourse.progress}%`}
                      />
                    </ListItem>
                  </List>
                  
                  <Box sx={{ mt: 2 }}>
                    <ProgressWidget
                      title={t('course.completionProgress')}
                      value={selectedCourse.progress}
                      maxValue={100}
                      variant="circular"
                      color="primary"
                      size="medium"
                    />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => console.log('Join virtual class')}>
                {t('course.joinVirtualClass')}
              </Button>
              <Button onClick={handleCloseCourseDetails}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentCourses;