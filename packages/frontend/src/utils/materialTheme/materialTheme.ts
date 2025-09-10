import { createTheme, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Material Design 3 color palette based on the app's dark aesthetic
export const createMaterialTheme = (): Theme => {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#c4a7e7', // Purple accent from existing theme
        light: '#e5d4f3',
        dark: '#9b70d3',
        contrastText: '#191724',
      },
      secondary: {
        main: '#9ccfd8', // Cyan accent from existing theme
        light: '#c4e4f7',
        dark: '#6b9aa5',
        contrastText: '#191724',
      },
      error: {
        main: '#eb6f92', // Error color from existing theme
        light: '#ffb2b8',
        dark: '#dd4b60',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#f6c177', // Orange/warning color
        light: '#fff0c2',
        dark: '#e6a94e',
        contrastText: '#191724',
      },
      info: {
        main: '#31748f', // Info blue
        light: '#6dc8ff',
        dark: '#005d62',
        contrastText: '#ffffff',
      },
      success: {
        main: '#40a02b', // Success green
        light: '#88d96b',
        dark: '#005f00',
        contrastText: '#ffffff',
      },
      background: {
        default: '#191724', // Primary background from existing theme
        paper: alpha('#1f1d2e', 0.95), // Slightly transparent version
      },
      text: {
        primary: '#e0def4', // Primary text color
        secondary: '#908caa', // Secondary text color
        disabled: alpha('#908caa', 0.5),
      },
      divider: alpha('#c4a7e7', 0.15),
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
        fontFamily: '"Times New Roman", Times, serif',
        fontWeight: 700,
        fontSize: '2.125rem',
        lineHeight: 1.2,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        textAlign: 'center',
      },
      h2: {
        fontFamily: '"Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: 1.3,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        textAlign: 'center',
      },
      h3: {
        fontFamily: '"Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        textAlign: 'center',
      },
      h4: {
        fontFamily: '"Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        textAlign: 'center',
      },
      h5: {
        fontFamily: '"Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.5,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        textAlign: 'center',
      },
      h6: {
        fontFamily: '"Times New Roman", Times, serif',
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
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
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
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
