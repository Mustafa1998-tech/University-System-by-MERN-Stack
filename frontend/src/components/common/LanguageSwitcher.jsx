import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import {
  Language as LanguageIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';

const LanguageSwitcher = ({ variant = 'select', size = 'medium' }) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
      direction: 'rtl'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (variant === 'menu') {
    return (
      <>
        <Tooltip title={t('settings.changeLanguage')}>
          <IconButton
            onClick={handleMenuOpen}
            size={size}
            color="inherit"
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 180,
              mt: 1
            }
          }}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top'
          }}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom'
          }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === i18n.language}
              sx={{
                direction: language.direction,
                textAlign: language.direction === 'rtl' ? 'right' : 'left'
              }}
            >
              <ListItemIcon>
                <Typography sx={{ fontSize: '1.2rem' }}>
                  {language.flag}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={language.nativeName}
                secondary={language.name}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: language.code === i18n.language ? 600 : 400
                  }
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  if (variant === 'button') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TranslateIcon color="action" />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {languages.map((language) => (
            <IconButton
              key={language.code}
              size="small"
              onClick={() => handleLanguageChange(language.code)}
              sx={{
                fontSize: '0.875rem',
                fontWeight: language.code === i18n.language ? 600 : 400,
                color: language.code === i18n.language ? 'primary.main' : 'text.secondary',
                minWidth: 'auto',
                padding: '4px 8px',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              {language.code.toUpperCase()}
            </IconButton>
          ))}
        </Box>
      </Box>
    );
  }

  // Default select variant
  return (
    <FormControl size={size} sx={{ minWidth: 120 }}>
      <Select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        variant="outlined"
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            value={language.code}
            sx={{
              direction: language.direction,
              textAlign: language.direction === 'rtl' ? 'right' : 'left'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1rem' }}>
                {language.flag}
              </Typography>
              <Typography>
                {language.nativeName}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;