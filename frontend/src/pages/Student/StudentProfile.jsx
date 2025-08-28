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
  TextField,
  Divider,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Family as FamilyIcon,
  Work as WorkIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';
import DynamicForm from '../../components/common/DynamicForm';
import FileUpload from '../../components/common/FileUpload';

const StudentProfile = () => {
  const { t, formatDate, isRTL } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(false);

  // Mock student data
  const studentData = {
    // Personal Information
    id: 'STU123456',
    arabicName: 'أحمد محمد علي الشريف',
    englishName: 'Ahmed Mohammed Ali Al-Sharif',
    email: 'ahmed.mohammed@university.edu',
    phone: '+966501234567',
    nationalId: '1234567890',
    dateOfBirth: new Date('1999-05-15'),
    gender: 'male',
    nationality: 'Saudi',
    religion: 'Islam',
    maritalStatus: 'single',
    avatar: '/images/student-avatar.jpg',
    
    // Address Information
    address: {
      street: 'شارع الملك فهد',
      streetEn: 'King Fahd Street',
      city: 'الرياض',
      cityEn: 'Riyadh',
      province: 'الرياض',
      provinceEn: 'Riyadh Province',
      postalCode: '12345',
      country: 'السعودية',
      countryEn: 'Saudi Arabia'
    },
    
    // Academic Information
    academic: {
      studentId: 'STU123456',
      admissionDate: new Date('2021-09-01'),
      faculty: 'كلية الهندسة',
      facultyEn: 'Faculty of Engineering',
      department: 'علوم الحاسوب',
      departmentEn: 'Computer Science',
      program: 'بكالوريوس علوم الحاسوب',
      programEn: 'Bachelor of Computer Science',
      level: 'السنة الثالثة',
      levelEn: 'Third Year',
      academicYear: '2024-2025',
      semester: 'الفصل الأول',
      semesterEn: 'Fall Semester',
      gpa: 3.75,
      completedCredits: 89,
      totalCredits: 120,
      expectedGraduation: new Date('2025-06-30'),
      academicStatus: 'نشط',
      academicStatusEn: 'Active'
    },
    
    // Emergency Contact
    emergencyContact: {
      name: 'محمد علي الشريف',
      nameEn: 'Mohammed Ali Al-Sharif',
      relationship: 'الوالد',
      relationshipEn: 'Father',
      phone: '+966501234568',
      email: 'mohammed.ali@email.com',
      address: 'نفس عنوان الطالب',
      addressEn: 'Same as student address'
    },
    
    // Financial Information
    financial: {
      tuitionStatus: 'مدفوع',
      tuitionStatusEn: 'Paid',
      scholarshipType: 'منحة جزئية',
      scholarshipTypeEn: 'Partial Scholarship',
      outstandingBalance: 2500,
      lastPaymentDate: new Date('2024-01-15'),
      paymentMethod: 'تحويل بنكي',
      paymentMethodEn: 'Bank Transfer'
    }
  };

  useEffect(() => {
    setProfileData(studentData);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call to save profile data
      console.log('Saving profile data:', profileData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(studentData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        aria-labelledby={`profile-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

  const personalInfoFields = [
    {
      name: 'arabicName',
      label: t('profile.arabicName'),
      type: 'text',
      required: true,
      disabled: !isEditing,
      value: profileData.arabicName || ''
    },
    {
      name: 'englishName',
      label: t('profile.englishName'),
      type: 'text',
      required: true,
      disabled: !isEditing,
      value: profileData.englishName || ''
    },
    {
      name: 'email',
      label: t('profile.email'),
      type: 'email',
      required: true,
      disabled: !isEditing,
      value: profileData.email || ''
    },
    {
      name: 'phone',
      label: t('profile.phone'),
      type: 'tel',
      required: true,
      disabled: !isEditing,
      value: profileData.phone || ''
    },
    {
      name: 'nationalId',
      label: t('profile.nationalId'),
      type: 'text',
      required: true,
      disabled: true, // National ID cannot be changed
      value: profileData.nationalId || ''
    },
    {
      name: 'dateOfBirth',
      label: t('profile.dateOfBirth'),
      type: 'date',
      required: true,
      disabled: true, // Date of birth cannot be changed
      value: profileData.dateOfBirth ? profileData.dateOfBirth.toISOString().split('T')[0] : ''
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileData.avatar}
                sx={{ width: 120, height: 120 }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              {isEditing && (
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <UploadIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
          <Grid item xs>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}
            >
              {isRTL ? profileData.arabicName : profileData.englishName}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {profileData.id} • {isRTL ? profileData.academic?.department : profileData.academic?.departmentEn}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Chip
                label={isRTL ? profileData.academic?.level : profileData.academic?.levelEn}
                color="primary"
                size="small"
              />
              <Chip
                label={isRTL ? profileData.academic?.academicStatus : profileData.academic?.academicStatusEn}
                color="success"
                size="small"
              />
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  {t('common.edit')}
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {t('common.save')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Profile Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('profile.personalInfo')} />
            <Tab label={t('profile.academicInfo')} />
            <Tab label={t('profile.addressInfo')} />
            <Tab label={t('profile.emergencyContact')} />
            <Tab label={t('profile.financialInfo')} />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('profile.personalInfo')}
                  </Typography>
                  <DynamicForm
                    fields={personalInfoFields}
                    onSubmit={handleSave}
                    onChange={(field, value) => handleInputChange(field, value)}
                    submitLabel={t('common.save')}
                    showSubmitButton={false}
                    layout="grid"
                    gridColumns={2}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('profile.quickInfo')}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.gender')}
                        secondary={t(`profile.${profileData.gender}`)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.age')}
                        secondary={`${new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear()} ${t('profile.years')}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.nationality')}
                        secondary={profileData.nationality}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FamilyIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.maritalStatus')}
                        secondary={t(`profile.${profileData.maritalStatus}`)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Academic Information Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('profile.academicDetails')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.faculty')}
                        secondary={isRTL ? profileData.academic?.faculty : profileData.academic?.facultyEn}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.department')}
                        secondary={isRTL ? profileData.academic?.department : profileData.academic?.departmentEn}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.admissionDate')}
                        secondary={formatDate(profileData.academic?.admissionDate)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('profile.expectedGraduation')}
                        secondary={formatDate(profileData.academic?.expectedGraduation)}
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
                    {t('profile.academicProgress')}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('student.gpa')}
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {profileData.academic?.gpa}/4.0
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('student.creditsProgress')}
                    </Typography>
                    <Typography variant="h6">
                      {profileData.academic?.completedCredits}/{profileData.academic?.totalCredits} {t('student.credits')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(profileData.academic?.completedCredits / profileData.academic?.totalCredits) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={t('profile.currentLevel')}
                        secondary={isRTL ? profileData.academic?.level : profileData.academic?.levelEn}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('profile.currentSemester')}
                        secondary={isRTL ? profileData.academic?.semester : profileData.academic?.semesterEn}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Address Information Tab */}
        <TabPanel value={currentTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.addressDetails')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.street')}
                    value={isRTL ? profileData.address?.street : profileData.address?.streetEn}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.city')}
                    value={isRTL ? profileData.address?.city : profileData.address?.cityEn}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.province')}
                    value={isRTL ? profileData.address?.province : profileData.address?.provinceEn}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.postalCode')}
                    value={profileData.address?.postalCode}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.country')}
                    value={isRTL ? profileData.address?.country : profileData.address?.countryEn}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Emergency Contact Tab */}
        <TabPanel value={currentTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.emergencyContactDetails')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.contactName')}
                    value={isRTL ? profileData.emergencyContact?.name : profileData.emergencyContact?.nameEn}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.relationship')}
                    value={isRTL ? profileData.emergencyContact?.relationship : profileData.emergencyContact?.relationshipEn}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.contactPhone')}
                    value={profileData.emergencyContact?.phone}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('profile.contactEmail')}
                    value={profileData.emergencyContact?.email}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('profile.contactAddress')}
                    value={isRTL ? profileData.emergencyContact?.address : profileData.emergencyContact?.addressEn}
                    disabled={!isEditing}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Financial Information Tab */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('profile.tuitionStatus')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('finance.tuitionStatus')}
                        secondary={isRTL ? profileData.financial?.tuitionStatus : profileData.financial?.tuitionStatusEn}
                      />
                      <Chip
                        label={isRTL ? profileData.financial?.tuitionStatus : profileData.financial?.tuitionStatusEn}
                        color="success"
                        size="small"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('finance.scholarshipType')}
                        secondary={isRTL ? profileData.financial?.scholarshipType : profileData.financial?.scholarshipTypeEn}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('finance.outstandingBalance')}
                        secondary={`${profileData.financial?.outstandingBalance} ${t('finance.currency')}`}
                      />
                      <Chip
                        label={profileData.financial?.outstandingBalance > 0 ? t('finance.outstanding') : t('finance.settled')}
                        color={profileData.financial?.outstandingBalance > 0 ? 'warning' : 'success'}
                        size="small"
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
                    {t('finance.paymentHistory')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('finance.lastPaymentDate')}
                        secondary={formatDate(profileData.financial?.lastPaymentDate)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('finance.paymentMethod')}
                        secondary={isRTL ? profileData.financial?.paymentMethod : profileData.financial?.paymentMethodEn}
                      />
                    </ListItem>
                  </List>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => console.log('View payment history')}
                  >
                    {t('finance.viewPaymentHistory')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StudentProfile;