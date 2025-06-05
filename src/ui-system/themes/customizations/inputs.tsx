import type {Components, Theme} from '@mui/material/styles';
import {alpha} from '@mui/material/styles';
import {outlinedInputClasses} from '@mui/material/OutlinedInput';
import {svgIconClasses} from '@mui/material/SvgIcon';
import {toggleButtonGroupClasses} from '@mui/material/ToggleButtonGroup';
import {toggleButtonClasses} from '@mui/material/ToggleButton';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import {brand, gray} from '../themePrimitives';

/* eslint-disable import/prefer-default-export */
export const inputsCustomizations: Components<Theme> = {
  MuiButtonBase: {
    defaultProps: {
      disableTouchRipple: true,
      disableRipple: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        boxSizing: 'border-box',
        transition: 'all 100ms ease-in',
        '&:focus-visible': {
          outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          outlineOffset: '2px',
        },
      }),
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiInputBase-root': {
          backgroundColor: (theme.vars || theme).palette.background.paper,
          ...theme.applyStyles('dark', {
            backgroundColor: theme.palette.grey[800],
          }),
        }
      }),
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      inputRoot: ({ theme }) => ({
        backgroundColor: `${theme.palette.grey[800]} !important`,
        color: `${theme.palette.common.white} !important`,
        ...theme.applyStyles('dark', {
          backgroundColor: `${theme.palette.grey[800]} !important`, 
        }),
      }),
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.background.paper,
        ...theme.applyStyles('dark', {
          backgroundColor: theme.palette.grey[900],
          color: theme.palette.common.white,
        }),
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        '--Paper-overlay': 'none',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: () => ({
        overlay: 'none',
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: () => ({
        backgroundColor: 'none',
        overlay: 'none',
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: 'none',
        borderRadius: (theme.vars || theme).shape.borderRadius,
        textTransform: 'none',
        variants: [
          {
            props: {
              size: 'small',
            },
            style: {
              height: '2.25rem',
              padding: '8px 12px',
            },
          },
          {
            props: {
              size: 'medium',
            },
            style: {
              height: '2.5rem', // 40px
            },
          },
          {
            props: {
              color: 'primary',
              variant: 'contained',
            },
            style: {
              color: 'white',
              //backgroundColor: gray[900],
              //backgroundImage: `linear-gradient(to bottom, ${gray[700]}, ${gray[800]})`,
              boxShadow: `inset 0 1px 0 ${gray[600]}, inset 0 -1px 0 1px hsl(220, 0%, 0%)`,
              border: `1px solid ${gray[700]}`,
              '&:hover': {
                backgroundImage: 'none',
                backgroundColor: gray[700],
                boxShadow: 'none',
              },
              '&:active': {
                backgroundColor: gray[800],
              },
              ...theme.applyStyles('dark', {
                color: 'black',
                backgroundColor: gray[50],
                backgroundImage: `linear-gradient(to bottom, ${gray[100]}, ${gray[50]})`,
                boxShadow: 'inset 0 -1px 0  hsl(220, 30%, 80%)',
                border: `1px solid ${gray[50]}`,
                '&:hover': {
                  backgroundImage: 'none',
                  backgroundColor: gray[300],
                  boxShadow: 'none',
                },
                '&:active': {
                  backgroundColor: gray[400],
                },
              }),
            },
          },
          {
            props: {
              color: 'secondary',
              variant: 'contained',
            },
            style: {
              color: 'white',
              backgroundColor: brand[300],
              backgroundImage: `linear-gradient(to bottom, ${alpha(brand[400], 0.8)}, ${brand[500]})`,
              boxShadow: `inset 0 2px 0 ${alpha(brand[200], 0.2)}, inset 0 -2px 0 ${alpha(brand[700], 0.4)}`,
              border: `1px solid ${brand[500]}`,
              '&:hover': {
                backgroundColor: brand[700],
                boxShadow: 'none',
              },
              '&:active': {
                backgroundColor: brand[700],
                backgroundImage: 'none',
              },
            },
          },
          {
            props: {
              variant: 'outlined',
            },
            style: {
              color: (theme.vars || theme).palette.text.primary,
              border: '1px solid',
              borderColor: gray[200],
              backgroundColor: alpha(gray[50], 0.3),
              '&:hover': {
                backgroundColor: gray[100],
                borderColor: gray[300],
              },
              '&:active': {
                backgroundColor: gray[200],
              },
              ...theme.applyStyles('dark', {
                backgroundColor: gray[800],
                borderColor: gray[700],

                '&:hover': {
                  backgroundColor: gray[900],
                  borderColor: gray[600],
                },
                '&:active': {
                  backgroundColor: gray[900],
                },
              }),
            },
          },
          {
            props: {
              color: 'secondary',
              variant: 'outlined',
            },
            style: {
              color: brand[700],
              border: '1px solid',
              borderColor: brand[200],
              backgroundColor: brand[50],
              '&:hover': {
                backgroundColor: brand[100],
                borderColor: brand[400],
              },
              '&:active': {
                backgroundColor: alpha(brand[200], 0.7),
              },
              ...theme.applyStyles('dark', {
                color: brand[50],
                border: '1px solid',
                borderColor: brand[900],
                backgroundColor: alpha(brand[900], 0.3),
                '&:hover': {
                  borderColor: brand[700],
                  backgroundColor: alpha(brand[900], 0.6),
                },
                '&:active': {
                  backgroundColor: alpha(brand[900], 0.5),
                },
              }),
            },
          },
          {
            props: {
              variant: 'text',
            },
            style: {
              color: gray[600],
              '&:hover': {
                backgroundColor: gray[100],
              },
              '&:active': {
                backgroundColor: gray[200],
              },
              ...theme.applyStyles('dark', {
                color: gray[50],
                '&:hover': {
                  backgroundColor: gray[700],
                },
                '&:active': {
                  backgroundColor: alpha(gray[700], 0.7),
                },
              }),
            },
          },
          {
            props: {
              color: 'secondary',
              variant: 'text',
            },
            style: {
              color: brand[700],
              '&:hover': {
                backgroundColor: alpha(brand[100], 0.5),
              },
              '&:active': {
                backgroundColor: alpha(brand[200], 0.7),
              },
              ...theme.applyStyles('dark', {
                color: brand[100],
                '&:hover': {
                  backgroundColor: alpha(brand[900], 0.5),
                },
                '&:active': {
                  backgroundColor: alpha(brand[900], 0.3),
                },
              }),
            },
          },
        ],
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: 'none',
        borderRadius: (theme.vars || theme).shape.borderRadius,
        textTransform: 'none',
        fontWeight: theme.typography.fontWeightMedium,
        letterSpacing: 0,
        color: (theme.vars || theme).palette.text.primary,
        border: '1px solid ',
        borderColor: gray[200],
        backgroundColor: alpha(gray[50], 0.3),
        '&:hover': {
          backgroundColor: gray[100],
          borderColor: gray[300],
        },
        '&:active': {
          backgroundColor: gray[200],
        },
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
          borderColor: gray[700],
          '&:hover': {
            backgroundColor: gray[900],
            borderColor: gray[600],
          },
          '&:active': {
            backgroundColor: gray[900],
          },
        }),
        variants: [
          {
            props: {
              size: 'small',
            },
            style: {
              width: '2.25rem',
              height: '2.25rem',
              padding: '0.25rem',
              [`& .${svgIconClasses.root}`]: { fontSize: '1rem' },
            },
          },
          {
            props: {
              size: 'medium',
            },
            style: {
              width: '2.5rem',
              height: '2.5rem',
            },
          },
        ],
      }),
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '10px',
        boxShadow: `0 4px 16px ${alpha(gray[400], 0.2)}`,
        [`& .${toggleButtonGroupClasses.selected}`]: {
          color: brand[500],
        },
        ...theme.applyStyles('dark', {
          [`& .${toggleButtonGroupClasses.selected}`]: {
            color: '#fff',
          },
          boxShadow: `0 4px 16px ${alpha(brand[700], 0.5)}`,
        }),
      }),
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '12px 16px',
        textTransform: 'none',
        borderRadius: '10px',
        fontWeight: 500,
        ...theme.applyStyles('dark', {
          color: gray[400],
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          [`&.${toggleButtonClasses.selected}`]: {
            color: brand[300],
          },
        }),
      }),
    },
  },
  MuiCheckbox: {
    defaultProps: {
      disableRipple: true,
      icon: (
        <CheckBoxOutlineBlankRoundedIcon sx={{ color: 'hsla(210, 0%, 0%, 0.0)' }} />
      ),
      checkedIcon: <CheckRoundedIcon sx={{ height: 14, width: 14 }} />,
      indeterminateIcon: <RemoveRoundedIcon sx={{ height: 14, width: 14 }} />,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        margin: 10,
        height: 16,
        width: 16,
        borderRadius: 5,
        border: '1px solid ',
        borderColor: alpha(gray[300], 0.8),
        boxShadow: '0 0 0 1.5px hsla(210, 0%, 0%, 0.04) inset',
        backgroundColor: alpha(gray[100], 0.4),
        transition: 'border-color, background-color, 120ms ease-in',
        '&:hover': {
          borderColor: brand[300],
        },
        '&.Mui-focusVisible': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          borderColor: brand[400],
        },
        '&.Mui-checked': {
          color: 'white',
          backgroundColor: brand[500],
          borderColor: brand[500],
          boxShadow: `none`,
          '&:hover': {
            backgroundColor: brand[600],
          },
        },
        ...theme.applyStyles('dark', {
          borderColor: alpha(gray[700], 0.8),
          boxShadow: '0 0 0 1.5px hsl(210, 0%, 0%) inset',
          backgroundColor: alpha(gray[900], 0.8),
          '&:hover': {
            borderColor: brand[300],
          },
          '&.Mui-focusVisible': {
            borderColor: brand[400],
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
          },
        }),
      }),
    },
  },
  

  
    MuiInputBase: {
      styleOverrides: {
        root: {
          // Styles here apply to the root div of InputBase (.MuiInputBase-root)
          // Keep or remove this border based on your design.
          border: 'none',
        },
        input: ({ theme }) => ({
           // Styles here apply to the actual <input> or <textarea> element (.MuiInputBase-input)
  
           // --- Specificity Boosts for various affected input types ---
           // Target input elements with the specified types AND the MUI input class.
           // Selector examples: .MuiInputBase-input[type="text"], .MuiInputBase-input[type="email"], etc.
           // Specificity for each part is 0,2,0 - higher than host's 0,1,1.
           // Add !important ONLY to properties where inspection showed the host rule won AND used !important.
           '&[type="text"], &[type="url"], &[type="date"], &[type="time"], &[type="number"], &[type="search"], &[type="password"], &[type="datetime"], &[type="datetime-local"], &[type="email"], &[type="tel"]': {
              // Override properties listed in the host rule that you want to change.
              // Add !important if necessary based on your browser inspection.
              fontFamily: 'inherit !important', // Example: if host overrides font-family
              border: 'none !important', // Example: if host applies a border directly to input
              borderRadius: '0px !important', // Example: if host sets border-radius
              fontWeight: 'normal !important', // Example: if host sets font-weight
              fontSize: '1em !important', // Example: if host sets font-size
              backgroundImage: 'none !important', // Example: if host sets background-image
              height: 'auto !important', // Example: if host sets height
              padding: '10px 12px !important', // Adjust value and add !important if needed
              boxSizing: 'border-box !important', // Example: if host sets box-sizing
              backgroundColor: `${(theme.vars || theme).palette.background.default} !important`, // Adjust value and add !important if needed
              borderColor: `${(theme.vars || theme).palette.divider} !important`, // Example: if host sets border-color directly
              color: `${(theme.vars || theme).palette.text.primary} !important`, // Adjust value and add !important if needed
  
               ...theme.applyStyles('dark', {
                 backgroundColor: `${(theme.vars || theme).palette.background.paper} !important`, // Or grey[800]
                 color: `${(theme.vars || theme).palette.common.white} !important`,
                 // Add dark mode specific overrides for other properties here too if needed
               }),
  
              // --- Placeholder styles nested for highest specificity (0,2,1) ---
               '&::placeholder': {
                  opacity: '0.7 !important', 
                  color: `${gray[500]} !important`, 
                   ...theme.applyStyles('dark', {
                     color: `${gray[400]} !important`,
                   }),
               },
              // --- End nested placeholder ---
           },
           // --- End Specificity Boosts ---
  
           // Handle textarea separately if needed. Host rule is just 'textarea' (0,0,1).
           // MUI class .MuiInputBase-input (0,1,0) should already be more specific.
           // If textarea is still overridden, inspect the winning host rule.
           // If needed, you could add a specific override here:
           // '&.MuiInputBase-inputMultiline': { /* styles for textareas */ } // Specificity 0,2,0
  
  
           // Keep base input styles here that apply to all input types or need lower specificity
           // Example: Font styles, text alignment, etc. if not overridden by host rule.
  
  
           // Styles for states like focused, hover, disabled on the input element (.MuiInputBase-input)
           // If the host's rule combines types AND states, you might need even higher specificity:
           // '&[type="text"]&.Mui-focused, &[type="email"]&.Mui-focused, ...': { /* focused styles */ } // Specificity 0,3,0 or higher
           '&.Mui-focused': { // Specificity 0,2,0
               // ... focused styles for the input element
           },
  
  
        }),
      },
    },
  
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: '8px 12px', // This is padding on the wrapper, not the input element
          color: (theme.vars || theme).palette.text.primary, // Applies to wrapper, inherited by input
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: `1px solid ${(theme.vars || theme).palette.divider}`, // Border on the wrapper
          backgroundColor: (theme.vars || theme).palette.background.default, // Background on the wrapper
          transition: 'border 120ms ease-in',
           '&:hover': {
             borderColor: gray[400],
             ...theme.applyStyles('dark', {
               borderColor: gray[500],
             }),
           },
           [`&.${outlinedInputClasses.focused}`]: { // Specificity 0,2,0
             outline: `3px solid ${alpha(brand[500], 0.5)}`,
             borderColor: brand[400],
           },
           ...theme.applyStyles('dark', {
             // ... dark mode root styles
           }),
        }),
        input: ({ theme }) => ({
          // Styles here apply to the actual <input> element (.MuiOutlinedInput-input)
  
          // --- Specificity Boosts for various affected input types ---
          // Target input elements with the specified types AND the MUI input class.
          // Selector examples: .MuiOutlinedInput-input[type="text"], .MuiOutlinedInput-input[type="email"], etc.
          // Specificity for each part is 0,2,0 - higher than host's 0,1,1.
          // Add !important ONLY to properties where inspection showed the host rule won AND used !important.
          '&[type="text"], &[type="url"], &[type="date"], &[type="time"], &[type="number"], &[type="search"], &[type="password"], &[type="datetime"], &[type="datetime-local"], &[type="email"], &[type="tel"]': {
             // Override properties listed in the host rule that you want to change.
             // Add !important if necessary based on your browser inspection.
             fontFamily: 'inherit !important', // Example
             border: 'none !important', // Example
             borderRadius: '0px !important', // Example
             fontWeight: 'normal !important', // Example
             fontSize: '1em !important', // Example
             backgroundImage: 'none !important', // Example
             height: 'auto !important', // Example
             padding: '10px 12px !important', // Adjust value and add !important if needed
             boxSizing: 'border-box !important', // Example
             backgroundColor: `${(theme.vars || theme).palette.background.default} !important`, // Adjust value and add !important if needed
             borderColor: `${(theme.vars || theme).palette.divider} !important`, // Example
             color: `${(theme.vars || theme).palette.text.primary} !important`, // Adjust value and add !important if needed
  
  
             ...theme.applyStyles('dark', {
               backgroundColor: `${(theme.vars || theme).palette.background.paper} !important`, // Or grey[800]
               color: `${(theme.vars || theme).palette.common.white} !important`,
               // Add dark mode specific overrides for other properties here too if needed
             }),
  
             // --- Placeholder styles nested for highest specificity (0,2,1) ---
              '&::placeholder': {
                 opacity: '0.7 !important', 
                 color: `${gray[500]} !important`, 
                  ...theme.applyStyles('dark', {
                    color: `${gray[400]} !important`,
                  }),
              },
             // --- End nested placeholder ---
          },
          // --- End Specificity Boosts ---
  
  
          // Keep base input styles here that apply to all input types or need lower specificity
          // Example: Font styles, text alignment, etc. if not overridden by host rule.
  
  
          // Styles for states like focused, hover, disabled on the input element (.MuiOutlinedInput-input)
           // If the host's rule combines types AND states, you might need even higher specificity:
           // '&[type="text"]&.Mui-focused, &[type="email"]&.Mui-focused, ...': { /* focused styles */ } // Specificity 0,3,0 or higher
           '&.Mui-focused': { // Specificity 0,2,0
               // ... focused styles for the input element
           },
  
        }),
        notchedOutline: {
          border: 'none',
        },
      },
    },

  MuiInputAdornment: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.grey[500],
        ...theme.applyStyles('dark', {
          color: (theme.vars || theme).palette.grey[400],
        }),
      }),
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: 'white',
        typography: theme.typography.caption,
        marginBottom: 8,
      }),
    },
  },
  
  // InputLabel customization to only remove transform for specific states
  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Only modify transforms when the label is shrunk/focused
        '&.MuiInputLabel-shrink': {
          transform: 'none',
          position: 'relative',
          top: 0,
          left: 0,
          fontWeight: theme.typography.fontWeightMedium,
          marginBottom: 4,
          fontSize: theme.typography.pxToRem(14),
          color: theme.palette.text.primary,
        },
      }),
      // Override specific variants when shrunk
      outlined: {
        '&.MuiInputLabel-shrink': {
          transform: 'none',
          position: 'relative',
          fontSize: 'inherit',
        }
      },
      standard: {
        '&.MuiInputLabel-shrink': {
          transform: 'none',
        }
      },
    },
  },
};
