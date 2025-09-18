import { createTheme, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Import centralized color tokens
import { COLORS } from '../tokens';

// Material Design 3 color palette based on the app's dark aesthetic
export const createMaterialTheme = (): Theme => {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: COLORS.primaryBlue || COLORS.primary || '#31748f',
        light: '#5ba3c7',
        dark: COLORS['primary-container'] || '#1e5a6b',
        contrastText: COLORS['on-primary'] || '#1f1d2e',
      },
      secondary: {
        main: COLORS.secondaryBlue || COLORS.secondary || '#9ccfd8',
        light: '#c4e4f7',
        dark: COLORS['secondary-container'] || '#6b9aa5',
        contrastText: COLORS['on-secondary'] || '#191724',
      },
      error: {
        main: COLORS.error || '#dc2626', // healthDying
        light: '#ffb2b8',
        dark: '#dd4b60',
        contrastText: '#ffffff',
      },
      warning: {
        main: (COLORS.health && COLORS.health.wounded) || COLORS['healthFillWoundedStart'] || '#fbbf24', // healthWounded
        light: '#fff0c2',
        dark: '#e6a94e',
        contrastText: COLORS['on-background'] || '#191724',
      },
      info: {
        main: COLORS.primaryBlue || COLORS.primary || '#31748f', // same as primary
        light: '#6dc8ff',
        dark: '#005d62',
        contrastText: '#ffffff',
      },
      success: {
        main: (COLORS.health && COLORS.health.healthy) || COLORS['healthFillHealthyStart'] || '#a3e635', // healthHealthy
        light: '#88d96b',
        dark: '#005f00',
        contrastText: COLORS['on-background'] || '#191724',
      },
      background: {
        default: COLORS.backgroundDark || COLORS.background || '#191724', // backgroundDark
        paper: alpha(COLORS.backgroundMedium || '#1f1d2e', 0.95), // backgroundMedium
      },
      text: {
        primary: COLORS.text && COLORS.text.primary || COLORS.textLight || '#e0def4', // textLight
        secondary: COLORS.text && COLORS.text.secondary || COLORS.textDark || '#908caa', // textDark
        disabled: alpha((COLORS.text && COLORS.text.secondary) || COLORS.textDark || '#908caa', 0.5),
      },
      divider: alpha(COLORS.borderGray || '#6e6a86', 0.15), // borderGray
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontFamily: '"Roboto Flex", "Times New Roman", Times, serif',
        fontWeight: 800,
        fontSize: '3rem', // Display Large
        lineHeight: 1.1,
        letterSpacing: '-0.015em',
        textAlign: 'center',
      },
      h2: {
        fontFamily: '"Roboto Flex", "Times New Roman", Times, serif',
        fontWeight: 700,
        fontSize: '2.5rem', // Display Medium
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        textAlign: 'center',
      },
      h3: {
        fontFamily: '"Roboto Flex", "Times New Roman", Times, serif',
        fontWeight: 700,
        fontSize: '2rem', // Display Small
        lineHeight: 1.25,
        letterSpacing: '0em',
        textAlign: 'center',
      },
      h4: {
        fontFamily: '"Roboto Flex", "Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1.75rem', // Headline Large
        lineHeight: 1.3,
        letterSpacing: '0.005em',
        textAlign: 'center',
      },
      h5: {
        fontFamily: '"Roboto Flex", "Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1.5rem', // Headline Medium
        lineHeight: 1.35,
        letterSpacing: '0.01em',
        textAlign: 'center',
      },
      h6: {
        fontFamily: '"Roboto Flex", "Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1.25rem', // Headline Small
        lineHeight: 1.4,
        letterSpacing: '0.015em',
        textAlign: 'center',
      },
      body1: {
        fontFamily: 'Inter',
        fontSize: '1rem',
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontFamily: 'Inter',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        letterSpacing: '0.01071em',
      },
      button: {
        fontFamily: 'Inter',
        fontSize: '0.9rem',
        fontWeight: 600,
        lineHeight: 1.75,
        letterSpacing: '0.02em',
        textTransform: 'none', // Disable uppercase transform for Material Design 3
      },
    },
    shape: {
      borderRadius: 8, // Material Design 3 rounded corners
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '.875rem',
            padding: '8px 16px',
            minHeight: 36,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            },
          },
          contained: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            },
            '&:active': {
              boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha('#c4a7e7', 0.12)}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${alpha('#c4a7e7', 0.15)}`,
          },
          elevation1: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '.875rem',
            minHeight: 40,
            borderRadius: 6,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: alpha('#c4a7e7', 0.23),
              },
              '&:hover fieldset': {
                borderColor: alpha('#c4a7e7', 0.4),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#c4a7e7',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            height: 24,
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#c4a7e7',
              '& + .MuiSwitch-track': {
                backgroundColor: '#c4a7e7',
                opacity: 0.7,
              },
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: '#c4a7e7',
            '& .MuiSlider-thumb': {
              boxShadow: '0px 2px 6px rgba(196, 167, 231, 0.25)',
            },
            '& .MuiSlider-track': {
              backgroundColor: '#c4a7e7',
            },
            '& .MuiSlider-rail': {
              backgroundColor: alpha('#c4a7e7', 0.3),
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0px 25px 50px rgba(0, 0, 0, 0.25)',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha('#c4a7e7', 0.12)}`,
            marginTop: 4,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: alpha('#191724', 0.95),
            color: '#e0def4',
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono',
            borderRadius: 6,
            padding: '8px 12px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${alpha('#c4a7e7', 0.15)}`,
          },
          arrow: {
            color: alpha('#191724', 0.95),
          },
        },
      },
    },
    spacing: 8, // Using 8px as base unit for Material Design 3 spacing scale
  });
};

// Material Design 3 elevation tokens
export const elevations = {
  surface: {
    level0: '0px 0px 0px 0px',
    level1: '0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
    level2: '0px 2px 6px 0px rgba(0, 0, 0, 0.15)',
    level3: '0px 3px 12px 0px rgba(0, 0, 0, 0.20)',
    level4: '0px 4px 16px 0px rgba(0, 0, 0, 0.25)',
    level5: '0px 6px 24px 0px rgba(0, 0, 0, 0.30)',
  },
};
