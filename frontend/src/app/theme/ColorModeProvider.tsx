import type { PaletteMode } from "@mui/material";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import { createAppTheme } from "./theme";

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const COLOR_MODE_STORAGE_KEY = "ecommerce-chat-color-mode";

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

function getInitialColorMode(): PaletteMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedMode = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);

  if (storedMode === "dark" || storedMode === "light") {
    return storedMode;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ColorModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<PaletteMode>(getInitialColorMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((currentMode) => {
          const nextMode = currentMode === "dark" ? "light" : "dark";
          window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, nextMode);
          return nextMode;
        });
      },
    }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("useColorMode must be used inside ColorModeProvider");
  }

  return context;
}
