"use client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Create emotion cache for Material-UI
// NOTE: In Next.js App Router, we need to be more careful with emotion cache
const createEmotionCache = () => {
  return createCache({
    key: "css",
    prepend: true,
  });
};

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#45A735",
    },
    secondary: {
      main: "#78EB54",
    },
  },
  typography: {
    fontFamily: "Open Sauce One Regular, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
        },
      },
    },
  },
});

// Client-side theme registry
export default function ThemeRegistry({ children }) {
  const cache = createEmotionCache();

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
