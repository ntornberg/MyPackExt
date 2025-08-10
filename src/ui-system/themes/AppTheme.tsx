import * as React from 'react';
import type { Components, Theme, ThemeOptions } from '@mui/material/styles';
import { createTheme, Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { autocompleteCustomizations, dataGridCustomizations } from './customizations/dataGrid';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, shadows, shape, typography } from './themePrimitives';
import { AppLogger } from '../../core/utils/logger.ts';

interface AppThemeProps {
  children: React.ReactNode;
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
}

/**
 * Wraps children with MUI CssVarsProvider and applies custom component theming.
 */
export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;
  const theme = React.useMemo(() => {
    AppLogger.info("Creating theme with MUI components");
    
    return disableCustomTheme
      ? {}
      : createTheme({
          // Use the remote colorSchemes definition (supports CSS vars provider)
          colorSchemes,
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
    <CssVarsProvider theme={theme} defaultMode="dark" disableTransitionOnChange>
      {children}
    </CssVarsProvider>
  );
}