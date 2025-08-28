import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Container
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AccountCircle as AccountIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useI18n } from '../hooks/useI18n';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const ExampleDashboard = () => {
  const { t, formatNumber, formatCurrency, formatDate, isRTL, getTextAlign } = useI18n();

  const stats = [
    {
      title: t('dashboard.totalStudents'),
      value: 1250,
      icon: <SchoolIcon />,
      color: '#2563eb'
    },
    {
      title: t('dashboard.totalInstructors'),
      value: 85,
      icon: <PeopleIcon />,
      color: '#059669'
    },
    {
      title: t('dashboard.totalCourses'),
      value: 120,
      icon: <AssignmentIcon />,
      color: '#dc2626'
    },
    {
      title: t('dashboard.activeEnrollments'),
      value: 3420,
      icon: <DashboardIcon />,
      color: '#7c3aed'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      message: t('dashboard.recentActivity'),
      timestamp: new Date('2024-01-15T10:30:00'),
      user: 'أحمد محمد'
    },
    {
      id: 2,
      message: 'New course enrollment',
      timestamp: new Date('2024-01-15T09:15:00'),
      user: 'Sarah Johnson'
    },
    {
      id: 3,
      message: 'Grade submission completed',
      timestamp: new Date('2024-01-15T08:45:00'),
      user: 'Dr. Robert Smith'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position=\"static\" elevation={1}>
        <Toolbar>
          <IconButton
            edge=\"start\"
            color=\"inherit\"
            aria-label=\"menu\"
            sx={{ 
              mr: isRTL ? 0 : 2, 
              ml: isRTL ? 2 : 0,
              transform: isRTL ? 'scaleX(-1)' : 'none'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant=\"h6\" 
            component=\"div\" 
            sx={{ 
              flexGrow: 1,
              textAlign: getTextAlign()
            }}
          >
            {t('navigation.dashboard')}
          </Typography>
          
          <LanguageSwitcher variant=\"menu\" />
          
          <IconButton color=\"inherit\">
            <AccountIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth=\"xl\" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant=\"h3\" 
            component=\"h1\" 
            gutterBottom
            sx={{ 
              textAlign: getTextAlign(),
              fontWeight: 700,
              color: 'primary.main'
            }}
          >
            {t('dashboard.welcome')}
          </Typography>
          
          <Typography 
            variant=\"subtitle1\" 
            color=\"text.secondary\"
            sx={{ textAlign: getTextAlign() }}
          >
            {formatDate(new Date())}
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      gap: 2
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {stat.icon}
                    </Box>
                    
                    <Box sx={{ textAlign: getTextAlign() }}>
                      <Typography 
                        variant=\"h4\" 
                        component=\"div\" 
                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                      >
                        {formatNumber(stat.value)}
                      </Typography>
                      
                      <Typography 
                        variant=\"body2\" 
                        color=\"text.secondary\"
                      >
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activities */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardContent>
                <Typography 
                  variant=\"h5\" 
                  component=\"h2\" 
                  gutterBottom
                  sx={{ 
                    textAlign: getTextAlign(),
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  {t('dashboard.recentActivity')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentActivities.map((activity) => (
                    <Box 
                      key={activity.id}
                      sx={{ 
                        p: 2, 
                        border: 1, 
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.default'
                      }}
                    >
                      <Typography 
                        variant=\"body1\" 
                        sx={{ textAlign: getTextAlign(), mb: 1 }}
                      >
                        {activity.message}
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          alignItems: 'center'
                        }}
                      >
                        <Typography 
                          variant=\"caption\" 
                          color=\"text.secondary\"
                        >
                          {activity.user}
                        </Typography>
                        
                        <Typography 
                          variant=\"caption\" 
                          color=\"text.secondary\"
                        >
                          {formatDate(activity.timestamp, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography 
                  variant=\"h5\" 
                  component=\"h2\" 
                  gutterBottom
                  sx={{ 
                    textAlign: getTextAlign(),
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  {t('dashboard.quickStats')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant=\"body2\" color=\"text.secondary\">
                      {t('dashboard.averageGPA')}
                    </Typography>
                    <Typography variant=\"h6\" sx={{ fontWeight: 'bold' }}>
                      3.65
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant=\"body2\" color=\"text.secondary\">
                      {t('dashboard.attendanceRate')}
                    </Typography>
                    <Typography variant=\"h6\" sx={{ fontWeight: 'bold' }}>
                      87%
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant=\"body2\" color=\"text.secondary\">
                      {t('finance.totalAmount')}
                    </Typography>
                    <Typography variant=\"h6\" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(125000)}
                    </Typography>
                  </Box>
                  
                  <Button 
                    variant=\"contained\" 
                    fullWidth 
                    sx={{ mt: 2 }}
                  >
                    {t('reports.generateReport')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ExampleDashboard;