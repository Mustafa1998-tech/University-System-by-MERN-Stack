import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create LTR cache
const cacheLtr = createCache({
  key: 'muiltr',
});

const RTLProvider = ({ children, theme }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // Update theme for RTL
  const rtlTheme = React.useMemo(() => {
    return createTheme({
      ...theme,
      direction: isRtl ? 'rtl' : 'ltr',
      typography: {
        ...theme.typography,
        fontFamily: isRtl 
          ? ['Tajawal', 'Cairo', 'Amiri', 'Arial', 'sans-serif'].join(',')
          : ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      },
      components: {
        ...theme.components,
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              direction: isRtl ? 'rtl' : 'ltr',
              fontFamily: isRtl 
                ? ['Tajawal', 'Cairo', 'Amiri', 'Arial', 'sans-serif'].join(',')
                : ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
            },
            '*': {
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.5)',
                },
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              textAlign: isRtl ? 'right' : 'left',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              right: isRtl ? 'auto' : undefined,
              left: isRtl ? undefined : 'auto',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              '& .MuiToolbar-root': {
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              transform: isRtl ? 'scaleX(-1)' : 'none',
              '&.no-flip': {
                transform: 'none',
              },
            },
          },
        },
        MuiList: {
          styleOverrides: {
            root: {
              '& .MuiListItem-root': {
                flexDirection: isRtl ? 'row-reverse' : 'row',
                textAlign: isRtl ? 'right' : 'left',
              },
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              justifyContent: isRtl ? 'flex-end' : 'flex-start',
              textAlign: isRtl ? 'right' : 'left',
              '& .MuiListItemIcon-root': {
                marginRight: isRtl ? 0 : 'auto',
                marginLeft: isRtl ? 'auto' : 0,
                minWidth: isRtl ? 'auto' : 56,
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiInputBase-input': {
                textAlign: isRtl ? 'right' : 'left',
              },
              '& .MuiInputLabel-root': {
                transformOrigin: isRtl ? 'top right' : 'top left',
                right: isRtl ? 14 : 'auto',
                left: isRtl ? 'auto' : 14,
              },
              '& .MuiOutlinedInput-notchedOutline legend': {
                textAlign: isRtl ? 'right' : 'left',
              },
            },
          },
        },
        MuiFormControlLabel: {
          styleOverrides: {
            root: {
              marginLeft: isRtl ? 0 : -11,
              marginRight: isRtl ? -11 : 0,
              '& .MuiFormControlLabel-label': {
                textAlign: isRtl ? 'right' : 'left',
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              '& .MuiChip-deleteIcon': {
                marginLeft: isRtl ? -6 : 5,
                marginRight: isRtl ? 5 : -6,
              },
            },
          },
        },
        MuiBreadcrumbs: {
          styleOverrides: {
            ol: {
              flexDirection: isRtl ? 'row-reverse' : 'row',
            },
            separator: {
              transform: isRtl ? 'scaleX(-1)' : 'none',
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              '& .MuiTabs-flexContainer': {
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              textAlign: isRtl ? 'right' : 'left',
              '& .MuiIconButton-root': {
                position: 'absolute',
                right: isRtl ? 'auto' : 8,
                left: isRtl ? 8 : 'auto',
                top: 8,
              },
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              '& .MuiAlert-icon': {
                marginRight: isRtl ? 0 : 12,
                marginLeft: isRtl ? 12 : 0,
              },
              '& .MuiAlert-action': {
                marginRight: isRtl ? 'auto' : -8,
                marginLeft: isRtl ? -8 : 'auto',
              },
            },
          },
        },
      },
    });
  }, [theme, isRtl]);

  // Update document direction
  useEffect(() => {
    const direction = isRtl ? 'rtl' : 'ltr';
    document.dir = direction;
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', i18n.language);
    
    // Update body class
    document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
    document.body.classList.add(direction);
    
    // Update CSS custom properties for direction
    document.documentElement.style.setProperty('--text-align-start', isRtl ? 'right' : 'left');
    document.documentElement.style.setProperty('--text-align-end', isRtl ? 'left' : 'right');
    document.documentElement.style.setProperty('--margin-start', isRtl ? 'margin-right' : 'margin-left');
    document.documentElement.style.setProperty('--margin-end', isRtl ? 'margin-left' : 'margin-right');
    document.documentElement.style.setProperty('--padding-start', isRtl ? 'padding-right' : 'padding-left');
    document.documentElement.style.setProperty('--padding-end', isRtl ? 'padding-left' : 'padding-right');
    document.documentElement.style.setProperty('--border-start', isRtl ? 'border-right' : 'border-left');
    document.documentElement.style.setProperty('--border-end', isRtl ? 'border-left' : 'border-right');
    document.documentElement.style.setProperty('--transform-direction', isRtl ? 'scaleX(-1)' : 'none');
  }, [isRtl, i18n.language]);

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={rtlTheme}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default RTLProvider;