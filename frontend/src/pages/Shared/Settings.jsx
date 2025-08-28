import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';
import DynamicForm from '../../components/common/DynamicForm';

const Settings = () => {
  const { t, changeLanguage, currentLanguage, isRTL } = useI18n();
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    language: 'ar',
    theme: 'light',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    gradeNotifications: true,
    attendanceAlerts: false,
    systemUpdates: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    
    // Display Settings
    compactView: false,
    showSidebar: true,
    itemsPerPage: 25,
    defaultView: 'dashboard'
  });
  const [loading, setLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      console.log('Saving settings:', settings);
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Apply language change immediately
      if (settings.language !== currentLanguage) {
        changeLanguage(settings.language);
      }
      
      // Show success message
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm(t('settings.confirmReset'))) {
      setSettings({
        language: 'ar',
        theme: 'light',
        timezone: 'Asia/Riyadh',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        weeklyReports: true,
        gradeNotifications: true,
        attendanceAlerts: false,
        systemUpdates: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowDirectMessages: true,
        twoFactorAuth: false,
        loginAlerts: true,
        sessionTimeout: 30,
        passwordExpiry: 90,
        compactView: false,
        showSidebar: true,
        itemsPerPage: 25,
        defaultView: 'dashboard'
      });
    }
  };

  const handleExportData = () => {
    setExportDialogOpen(true);
  };

  const handlePasswordChange = (passwordData) => {
    console.log('Changing password:', passwordData);
    setPasswordDialogOpen(false);
  };

  const passwordChangeFields = [
    {
      name: 'currentPassword',
      label: t('settings.currentPassword'),
      type: 'password',
      required: true
    },
    {
      name: 'newPassword',
      label: t('settings.newPassword'),
      type: 'password',
      required: true
    },
    {
      name: 'confirmPassword',
      label: t('settings.confirmPassword'),
      type: 'password',
      required: true
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`settings-tabpanel-${index}`}
        aria-labelledby={`settings-tab-${index}`}
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
        {t('navigation.settings')}
      </Typography>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={t('settings.general')} 
              icon={<SettingsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={t('settings.notifications')} 
              icon={<NotificationsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={t('settings.privacy')} 
              icon={<PersonIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={t('settings.security')} 
              icon={<SecurityIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={t('settings.display')} 
              icon={<PaletteIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* General Settings Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon />
                    {t('settings.languageRegion')}
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.language')}</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      label={t('settings.language')}
                    >
                      <MenuItem value="ar">{t('settings.arabic')}</MenuItem>
                      <MenuItem value="en">{t('settings.english')}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.timezone')}</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      label={t('settings.timezone')}
                    >
                      <MenuItem value="Asia/Riyadh">{t('settings.riyadh')}</MenuItem>
                      <MenuItem value="Asia/Dubai">{t('settings.dubai')}</MenuItem>
                      <MenuItem value="Asia/Kuwait">{t('settings.kuwait')}</MenuItem>
                      <MenuItem value="UTC">UTC</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.dateFormat')}</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      label={t('settings.dateFormat')}
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.timeFormat')}</InputLabel>
                    <Select
                      value={settings.timeFormat}
                      onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                      label={t('settings.timeFormat')}
                    >
                      <MenuItem value="12h">{t('settings.12hour')}</MenuItem>
                      <MenuItem value="24h">{t('settings.24hour')}</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaletteIcon />
                    {t('settings.appearance')}
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.theme')}</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      label={t('settings.theme')}
                    >
                      <MenuItem value="light">{t('settings.lightTheme')}</MenuItem>
                      <MenuItem value="dark">{t('settings.darkTheme')}</MenuItem>
                      <MenuItem value="auto">{t('settings.autoTheme')}</MenuItem>
                    </Select>
                  </FormControl>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t('settings.themeNote')}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.notificationChannels')}
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('settings.emailNotifications')}
                        secondary={t('settings.emailNotificationsDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.smsNotifications')}
                        secondary={t('settings.smsNotificationsDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.smsNotifications}
                          onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.pushNotifications')}
                        secondary={t('settings.pushNotificationsDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.pushNotifications}
                          onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.notificationTypes')}
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('settings.gradeNotifications')}
                        secondary={t('settings.gradeNotificationsDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.gradeNotifications}
                          onChange={(e) => handleSettingChange('gradeNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.attendanceAlerts')}
                        secondary={t('settings.attendanceAlertsDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.attendanceAlerts}
                          onChange={(e) => handleSettingChange('attendanceAlerts', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.weeklyReports')}
                        secondary={t('settings.weeklyReportsDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.weeklyReports}
                          onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.systemUpdates')}
                        secondary={t('settings.systemUpdatesDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.systemUpdates}
                          onChange={(e) => handleSettingChange('systemUpdates', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Privacy Tab */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.profilePrivacy')}
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.profileVisibility')}</InputLabel>
                    <Select
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                      label={t('settings.profileVisibility')}
                    >
                      <MenuItem value="public">{t('settings.public')}</MenuItem>
                      <MenuItem value="university">{t('settings.universityOnly')}</MenuItem>
                      <MenuItem value="private">{t('settings.private')}</MenuItem>
                    </Select>
                  </FormControl>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('settings.showEmail')}
                        secondary={t('settings.showEmailDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.showEmail}
                          onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.showPhone')}
                        secondary={t('settings.showPhoneDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.showPhone}
                          onChange={(e) => handleSettingChange('showPhone', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.allowDirectMessages')}
                        secondary={t('settings.allowDirectMessagesDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.allowDirectMessages}
                          onChange={(e) => handleSettingChange('allowDirectMessages', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.dataManagement')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportData}
                      fullWidth
                    >
                      {t('settings.exportData')}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      component="label"
                      fullWidth
                    >
                      {t('settings.importData')}
                      <input type="file" hidden accept=".json" />
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => console.log('Request data deletion')}
                      fullWidth
                    >
                      {t('settings.deleteAccount')}
                    </Button>
                  </Box>

                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {t('settings.dataManagementNote')}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.authenticationSecurity')}
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('settings.twoFactorAuth')}
                        secondary={t('settings.twoFactorAuthDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.twoFactorAuth}
                          onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.loginAlerts')}
                        secondary={t('settings.loginAlertsDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.loginAlerts}
                          onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <TextField
                    fullWidth
                    type="number"
                    label={t('settings.sessionTimeout')}
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    helperText={t('settings.sessionTimeoutDesc')}
                    margin="normal"
                    inputProps={{ min: 5, max: 1440 }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label={t('settings.passwordExpiry')}
                    value={settings.passwordExpiry}
                    onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                    helperText={t('settings.passwordExpiryDesc')}
                    margin="normal"
                    inputProps={{ min: 30, max: 365 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.passwordSecurity')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setPasswordDialogOpen(true)}
                      fullWidth
                    >
                      {t('settings.changePassword')}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => console.log('View login history')}
                      fullWidth
                    >
                      {t('settings.viewLoginHistory')}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => console.log('Terminate all sessions')}
                      fullWidth
                    >
                      {t('settings.terminateAllSessions')}
                    </Button>
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t('settings.passwordSecurityNote')}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Display Tab */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.interfaceSettings')}
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t('settings.compactView')}
                        secondary={t('settings.compactViewDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.compactView}
                          onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary={t('settings.showSidebar')}
                        secondary={t('settings.showSidebarDesc')}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.showSidebar}
                          onChange={(e) => handleSettingChange('showSidebar', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.itemsPerPage')}</InputLabel>
                    <Select
                      value={settings.itemsPerPage}
                      onChange={(e) => handleSettingChange('itemsPerPage', e.target.value)}
                      label={t('settings.itemsPerPage')}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.defaultView')}</InputLabel>
                    <Select
                      value={settings.defaultView}
                      onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                      label={t('settings.defaultView')}
                    >
                      <MenuItem value="dashboard">{t('navigation.dashboard')}</MenuItem>
                      <MenuItem value="courses">{t('navigation.courses')}</MenuItem>
                      <MenuItem value="grades">{t('navigation.grades')}</MenuItem>
                      <MenuItem value="profile">{t('navigation.profile')}</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.displayPreview')}
                  </Typography>
                  
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('settings.previewTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('settings.previewDescription')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={t('common.sample')} size="small" />
                      <Chip label={t('common.preview')} size="small" variant="outlined" />
                    </Box>
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t('settings.displayPreviewNote')}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Action Buttons */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleResetSettings}
          >
            {t('settings.resetToDefaults')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {t('common.save')}
          </Button>
        </Box>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('settings.changePassword')}
        </DialogTitle>
        <DialogContent>
          <DynamicForm
            fields={passwordChangeFields}
            onSubmit={handlePasswordChange}
            submitLabel={t('settings.updatePassword')}
            showSubmitButton={false}
            layout="vertical"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained"
            onClick={() => document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
          >
            {t('settings.updatePassword')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('settings.exportData')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            {t('settings.exportDataDescription')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary={t('settings.profileData')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('settings.academicRecords')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('settings.settingsPreferences')} />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              console.log('Exporting user data');
              setExportDialogOpen(false);
            }}
          >
            {t('settings.downloadData')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;