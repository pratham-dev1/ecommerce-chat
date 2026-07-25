import { createTheme, type PaletteMode } from "@mui/material/styles";

const getComponents = () => ({
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 700,
        textTransform: "none",
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      fullWidth: true,
      variant: "outlined" as const,
    },
  },
});

const lightPalette = {
  background: {
    default: "#f7f8fa",
    paper: "#ffffff",
  },
  primary: {
    main: "#0f766e",
  },
  secondary: {
    main: "#4057c8",
  },
  text: {
    primary: "#172026",
    secondary: "#5f6b76",
  },
};

const darkPalette = {
  background: {
    default: "#101418",
    paper: "#171d23",
  },
  primary: {
    main: "#2dd4bf",
  },
  secondary: {
    main: "#8ea0ff",
  },
  text: {
    primary: "#f4f7fb",
    secondary: "#a9b4c0",
  },
};

export function createAppTheme(mode: PaletteMode) {
  return createTheme({
    components: getComponents(),
    palette: {
      mode,
      ...(mode === "dark" ? darkPalette : lightPalette),
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      button: {
        letterSpacing: 0,
      },
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontSize: "2rem",
        fontWeight: 800,
        letterSpacing: 0,
      },
      h2: {
        fontSize: "1.35rem",
        fontWeight: 750,
        letterSpacing: 0,
      },
    },
  });
}

export type ColorMode = PaletteMode;
