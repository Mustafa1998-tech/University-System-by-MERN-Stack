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
  Alert,
  Fab,
  Menu,
  MenuItem
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';
import DataTable from '../../components/common/DataTable';
import {
  StatWidget,
  ListWidget,
  ProgressWidget
} from '../../components/widgets/DashboardWidgets';

const InstructorCourses = () => {
  const { t, formatDate, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourseForMenu, setSelectedCourseForMenu] = useState(null);

  // Mock instructor courses data
  const instructorCourses = [
    {
      id: 'CS301',
      code: 'CS301',
      name: 'البرمجة المتقدمة',
      nameEn: 'Advanced Programming',
      credits: 3,
      semester: 'الفصل الأول 2024-2025',
      semesterEn: 'Fall 2024-2025',
      schedule: [
        { day: 'الأحد', dayEn: 'Sunday', time: '09:00-10:30', room: 'Lab 101' },
        { day: 'الثلاثاء', dayEn: 'Tuesday', time: '09:00-10:30', room: 'Lab 101' }
      ],
      enrolledStudents: 42,
      maxStudents: 45,
      status: 'active',
      description: 'مقرر يتناول مفاهيم البرمجة المتقدمة باستخدام لغات البرمجة الحديثة',
      descriptionEn: 'Course covering advanced programming concepts using modern programming languages',
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      assignments: [
        { 
          id: 1, 
          title: 'مشروع عملي', 
          titleEn: 'Practical Project', 
          dueDate: new Date('2024-02-20'), 
          submitted: 38,
          graded: 25,
          status: 'active' 
        },
        { 
          id: 2, 
          title: 'اختبار قصير', 
          titleEn: 'Quiz', 
          dueDate: new Date('2024-02-15'), 
          submitted: 42,
          graded: 42,
          status: 'completed' 
        }
      ],
      recentActivity: [
        { type: 'submission', student: 'أحمد محمد', studentEn: 'Ahmed Mohammed', action: 'submitted assignment', time: '2 hours ago' },
        { type: 'grade', student: 'فاطمة علي', studentEn: 'Fatima Ali', action: 'graded assignment', time: '3 hours ago' }
      ]
    },
    {
      id: 'CS401',
      code: 'CS401',
      name: 'مشروع التخرج',
      nameEn: 'Graduation Project',
      credits: 6,
      semester: 'الفصل الأول 2024-2025',
      semesterEn: 'Fall 2024-2025',
      schedule: [
        { day: 'الخميس', dayEn: 'Thursday', time: '13:00-15:00', room: 'Lab 201' }
      ],
      enrolledStudents: 15,
      maxStudents: 20,
      status: 'active',
      description: 'مشروع التخرج النهائي للطلاب في تخصص علوم الحاسوب',
      descriptionEn: 'Final graduation project for Computer Science students',
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      assignments: [
        { 
          id: 3, 
          title: 'اقتراح المشروع', 
          titleEn: 'Project Proposal', 
          dueDate: new Date('2024-03-01'), 
          submitted: 12,
          graded: 8,
          status: 'active' 
        }
      ],
      recentActivity: [
        { type: 'meeting', student: 'سارة أحمد', studentEn: 'Sara Ahmed', action: 'project meeting scheduled', time: '1 day ago' }
      ]
    },
    {
      id: 'CS201',
      code: 'CS201',
      name: 'تراكيب البيانات',
      nameEn: 'Data Structures',
      credits: 3,
      semester: 'الفصل الأول 2024-2025',
      semesterEn: 'Fall 2024-2025',
      schedule: [
        { day: 'الإثنين', dayEn: 'Monday', time: '10:00-11:30', room: 'Room 105' },
        { day: 'الأربعاء', dayEn: 'Wednesday', time: '10:00-11:30', room: 'Room 105' }
      ],
      enrolledStudents: 38,
      maxStudents: 40,
      status: 'active',
      description: 'مقرر يغطي أساسيات تراكيب البيانات والخوارزميات',
      descriptionEn: 'Course covering fundamentals of data structures and algorithms',
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      assignments: [
        { 
          id: 4, 
          title: 'تنفيذ قائمة مترابطة', 
          titleEn: 'Linked List Implementation', 
          dueDate: new Date('2024-02-22'), 
          submitted: 35,
          graded: 30,
          status: 'active' 
        }
      ],
      recentActivity: [
        { type: 'question', student: 'محمد حسن', studentEn: 'Mohammed Hassan', action: 'asked question in forum', time: '4 hours ago' }
      ]
    }
  ];

  // Course statistics
  const courseStats = [
    {
      title: t('instructor.totalCourses'),
      value: instructorCourses.length,
      subtitle: t('instructor.thisemester'),
      icon: <SchoolIcon />,
      color: 'primary'
    },
    {
      title: t('instructor.totalStudents'),
      value: instructorCourses.reduce((sum, course) => sum + course.enrolledStudents, 0),
      subtitle: t('instructor.enrolled'),
      icon: <PeopleIcon />,
      color: 'secondary'
    },
    {
      title: t('instructor.pendingGrading'),
      value: instructorCourses.reduce((sum, course) => 
        sum + course.assignments.reduce((assignmentSum, assignment) => 
          assignmentSum + (assignment.submitted - assignment.graded), 0), 0),
      subtitle: t('instructor.submissions'),
      icon: <GradeIcon />,
      color: 'warning'
    },
    {
      title: t('instructor.activeAssignments'),
      value: instructorCourses.reduce((sum, course) => 
        sum + course.assignments.filter(a => a.status === 'active').length, 0),
      subtitle: t('instructor.currentSemester'),
      icon: <AssignmentIcon />,
      color: 'info'
    }
  ];

  // All assignments from all courses
  const allAssignments = instructorCourses.flatMap(course => 
    course.assignments.map(assignment => ({
      ...assignment,
      courseName: isRTL ? course.name : course.nameEn,
      courseCode: course.code
    }))
  );

  // All students from all courses
  const allStudents = [
    // Mock student data - in real app this would come from API
    { id: 1, name: 'أحمد محمد علي', nameEn: 'Ahmed Mohammed Ali', studentId: 'STU001', course: 'CS301', grade: 'A-', attendance: 95 },
    { id: 2, name: 'فاطمة علي حسن', nameEn: 'Fatima Ali Hassan', studentId: 'STU002', course: 'CS301', grade: 'B+', attendance: 88 },
    { id: 3, name: 'سارة أحمد محمد', nameEn: 'Sara Ahmed Mohammed', studentId: 'STU003', course: 'CS401', grade: 'A', attendance: 92 },
    { id: 4, name: 'محمد حسن علي', nameEn: 'Mohammed Hassan Ali', studentId: 'STU004', course: 'CS201', grade: 'B', attendance: 85 }
  ];

  const handleCourseDetails = (course) => {
    setSelectedCourse(course);
    setCourseDetailsOpen(true);
  };

  const handleCloseCourseDetails = () => {
    setCourseDetailsOpen(false);
    setSelectedCourse(null);
  };

  const handleMenuClick = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourseForMenu(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourseForMenu(null);
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
        id={`instructor-courses-tabpanel-${index}`}
        aria-labelledby={`instructor-courses-tab-${index}`}
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
          {t('instructor.myCourses')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Add new course')}
        >
          {t('instructor.addCourse')}
        </Button>
      </Box>

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
            <Tab label={t('instructor.courses')} />
            <Tab label={t('instructor.assignments')} />
            <Tab label={t('instructor.students')} />
            <Tab label={t('instructor.schedule')} />
          </Tabs>
        </Box>

        {/* Courses Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {instructorCourses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                        {isRTL ? course.name : course.nameEn}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={course.code}
                          color="primary"
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, course)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {isRTL ? course.description : course.descriptionEn}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('course.enrolledStudents')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {course.enrolledStudents}/{course.maxStudents} {t('common.students')}
                      </Typography>
                      <ProgressWidget
                        value={course.enrolledStudents}
                        maxValue={course.maxStudents}
                        variant="linear"
                        color="secondary"
                        showLabel={false}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('course.credits')}
                      </Typography>
                      <Typography variant="body2">
                        {course.credits} {t('course.creditHours')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={t(`course.${course.status}`)}
                        color={getStatusColor(course.status)}
                        size="small"
                      />
                      <Chip
                        label={`${course.assignments.length} ${t('course.assignments')}`}
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Recent Activity */}
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {t('instructor.recentActivity')}
                    </Typography>
                    <List dense>
                      {course.recentActivity.slice(0, 2).map((activity, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Typography variant="caption">
                                {isRTL ? activity.student : activity.studentEn} {activity.action}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => handleCourseDetails(course)}
                        >
                          {t('common.manage')}
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<VideoCallIcon />}
                          onClick={() => console.log('Start virtual class', course.id)}
                        >
                          {t('instructor.startClass')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Assignments Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => console.log('Create new assignment')}
            >
              {t('instructor.createAssignment')}
            </Button>
          </Box>
          
          <DataTable
            data={allAssignments}
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
                id: 'submissions',
                label: t('instructor.submissions'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="body2">
                      {row.submitted}/{row.graded} {t('instructor.submitted')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.graded} {t('instructor.graded')}
                    </Typography>
                  </Box>
                )
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => console.log('View assignment', row.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => console.log('Edit assignment', row.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => console.log('Grade submissions', row.id)}
                    >
                      <GradeIcon />
                    </IconButton>
                  </Box>
                )
              }
            ]}
            showCheckboxes={false}
            showAdd={false}
            showExport={true}
            emptyMessage={t('instructor.noAssignments')}
          />
        </TabPanel>

        {/* Students Tab */}
        <TabPanel value={currentTab} index={2}>
          <DataTable
            data={allStudents}
            columns={[
              {
                id: 'name',
                label: t('common.student'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {isRTL ? row.name : row.nameEn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.studentId}
                    </Typography>
                  </Box>
                )
              },
              {
                id: 'course',
                label: t('course.course'),
                render: (value, row) => row.course
              },
              {
                id: 'grade',
                label: t('student.grades'),
                render: (value, row) => (
                  <Chip
                    label={row.grade}
                    color="success"
                    size="small"
                  />
                )
              },
              {
                id: 'attendance',
                label: t('instructor.attendance'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="body2">
                      {row.attendance}%
                    </Typography>
                    <ProgressWidget
                      value={row.attendance}
                      maxValue={100}
                      variant="linear"
                      color={row.attendance >= 75 ? 'success' : 'warning'}
                      showLabel={false}
                      size="small"
                    />
                  </Box>
                )
              },
              {
                id: 'actions',
                label: t('common.actions'),
                render: (value, row) => (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => console.log('View student profile', row.id)}
                  >
                    {t('common.view')}
                  </Button>
                )
              }
            ]}
            showCheckboxes={false}
            showAdd={false}
            showExport={true}
            emptyMessage={t('instructor.noStudents')}
          />
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={currentTab} index={3}>
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('instructor.scheduleNote')}
          </Alert>
          
          <DataTable
            data={instructorCourses.flatMap(course =>
              course.schedule.map(schedule => ({
                ...schedule,
                courseName: isRTL ? course.name : course.nameEn,
                courseCode: course.code,
                students: course.enrolledStudents
              }))
            )}
            columns={[
              {
                id: 'course',
                label: t('course.course'),
                render: (value, row) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {row.courseName}
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
                id: 'students',
                label: t('course.enrolledStudents'),
                render: (value, row) => row.students
              },
              {
                id: 'actions',
                label: t('common.actions'),
                render: (value, row) => (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<VideoCallIcon />}
                    onClick={() => console.log('Start virtual class')}
                  >
                    {t('instructor.startClass')}
                  </Button>
                )
              }
            ]}
            showCheckboxes={false}
            showAdd={false}
            showExport={true}
            emptyMessage={t('instructor.noSchedule')}
          />
        </TabPanel>
      </Paper>

      {/* Course Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { console.log('Edit course'); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={() => { console.log('Upload materials'); handleMenuClose(); }}>
          <FileUploadIcon sx={{ mr: 1 }} />
          {t('instructor.uploadMaterials')}
        </MenuItem>
        <MenuItem onClick={() => { console.log('View analytics'); handleMenuClose(); }}>
          <VisibilityIcon sx={{ mr: 1 }} />
          {t('instructor.viewAnalytics')}
        </MenuItem>
        <MenuItem onClick={() => { console.log('Delete course'); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Course Details Dialog */}
      <Dialog
        open={courseDetailsOpen}
        onClose={handleCloseCourseDetails}
        maxWidth="lg"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {t('instructor.manageCourse')}: {isRTL ? selectedCourse.name : selectedCourse.nameEn}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCourse.code} • {selectedCourse.enrolledStudents} {t('common.students')}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {t('course.courseInfo')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('course.department')}
                        secondary={isRTL ? selectedCourse.department : selectedCourse.departmentEn}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('course.credits')}
                        secondary={`${selectedCourse.credits} ${t('course.creditHours')}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('course.enrolledStudents')}
                        secondary={`${selectedCourse.enrolledStudents}/${selectedCourse.maxStudents}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {t('course.schedule')}
                  </Typography>
                  <List>
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
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => console.log('Edit course')}>
                {t('common.edit')}
              </Button>
              <Button onClick={() => console.log('View students')}>
                {t('instructor.viewStudents')}
              </Button>
              <Button onClick={handleCloseCourseDetails}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => console.log('Quick add assignment')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default InstructorCourses;