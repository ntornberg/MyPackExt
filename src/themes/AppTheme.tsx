import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { Components } from '@mui/material/styles';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { dataGridCustomizations } from './customizations/dataGrid';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { autocompleteCustomizations } from './customizations/dataGrid';
import { colorSchemes as baseColorSchemes, typography, shadows, shape } from './themePrimitives';
import { AppLogger } from '../utils/logger';

interface AppThemeProps {
  children: React.ReactNode;
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;
  const theme = React.useMemo(() => {
    AppLogger.info("Creating theme with MUI components");
    
    return disableCustomTheme
      ? {}
      : createTheme({

          // For more details about CSS variables configuration, see https://mui.com/material-ui/customization/css-theme-variables/configuration/
          cssVariables: {
            colorSchemeSelector: 'data-mui-color-scheme',
            cssVarPrefix: 'template'
          },
          palette: {
            mode: 'dark',
          },
          colorSchemes: { dark: baseColorSchemes.dark },
          typography,
          shadows,
          shape,
          components: {
            ...dataGridCustomizations,
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            ...autocompleteCustomizations,
            ...themeComponents,
            
          } as Components<Theme>,
        });
  }, [disableCustomTheme, themeComponents]);
  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
