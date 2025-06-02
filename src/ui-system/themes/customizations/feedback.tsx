import { alpha } from '@mui/material/styles';
import type { Theme, Components } from '@mui/material/styles';
import { gray, orange, green, red, brand } from '../themePrimitives';

/* eslint-disable import/prefer-default-export */
export const feedbackCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme, ownerState }) => {
        const severity = ownerState.severity || 'info';
        
        // Define colors for each severity
        const severityColors = {
          success: {
            light: { bg: green[100], border: green[300], icon: green[600] },
            dark: { bg: alpha(green[900], 0.7), border: alpha(green[700], 0.5), icon: green[400] }
          },
          error: {
            light: { bg: red[100], border: red[300], icon: red[600] },
            dark: { bg: alpha(red[900], 0.7), border: alpha(red[700], 0.5), icon: red[400] }
          },
          warning: {
            light: { bg: orange[100], border: orange[300], icon: orange[600] },
            dark: { bg: alpha(orange[900], 0.7), border: alpha(orange[800], 0.5), icon: orange[400] }
          },
          info: {
            light: { bg: brand[100], border: brand[300], icon: brand[600] },
            dark: { bg: alpha(brand[900], 0.7), border: alpha(brand[800], 0.5), icon: brand[400] }
          }
        };

        const colors = severityColors[severity];

        return {
          borderRadius: 10,
          backgroundColor: colors.light.bg,
          color: (theme.vars || theme).palette.text.primary,
          border: `1px solid ${alpha(colors.light.border, 0.5)}`,
          '& .MuiAlert-icon': {
            color: colors.light.icon,
          },
          ...theme.applyStyles('dark', {
            backgroundColor: colors.dark.bg,
            border: `1px solid ${colors.dark.border}`,
            color: 'white',
            '& .MuiAlert-icon': {
              color: colors.dark.icon,
            },
            '& .MuiAlertTitle-root': {
              color: 'white',
            },
          }),
        };
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
};
