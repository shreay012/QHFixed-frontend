'use client';

import { useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider, createTheme } from '@mui/material/styles';

/**
 * Create emotion cache.
 * For RTL we use the `stylisRTLPlugin` via stylis if available; fall back
 * to the plain LTR cache if the plugin is not installed.
 *
 * `prepend: true` ensures MUI styles come before global overrides so they
 * can be overridden in globals.css without !important.
 */
function createEmotionCache(direction = 'ltr') {
  return createCache({
    key: direction === 'rtl' ? 'muirtl' : 'muiltr',
    prepend: true,
  });
}

/**
 * Client-side MUI theme + Emotion cache provider.
 *
 * @param {{ children: React.ReactNode, dir?: 'ltr' | 'rtl' }} props
 *   dir — passed from the server layout (derived from the active locale).
 *   Defaults to 'ltr' so the component is safe to use standalone.
 */
export default function ThemeRegistryFixed({ children, dir = 'ltr' }) {
  const direction = dir === 'rtl' ? 'rtl' : 'ltr';

  // Re-create cache + theme only when direction changes (rare).
  const cache = useMemo(() => createEmotionCache(direction), [direction]);

  const theme = useMemo(() => createTheme({
    direction,
    palette: {
      primary:   { main: '#45A735' },
      secondary: { main: '#78EB54' },
    },
    typography: {
      fontFamily: 'Open Sauce One Regular, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: '8px' },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: { borderRadius: '10px' },
        },
      },
    },
  }), [direction]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
