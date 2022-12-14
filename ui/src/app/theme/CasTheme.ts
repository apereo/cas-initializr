
import { ThemeOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

import { cyan, teal, grey } from "@mui/material/colors";
import { PaletteMode } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === "light"
            ? {
                  // palette values for light mode
                  primary: teal,
                  divider: grey[800],
                  text: {
                      primary: grey[900],
                      secondary: grey[800],
                  },
              }
            : {
                  // palette values for dark mode
                  primary: {
                      light: cyan[200],
                      main: cyan[400],
                      dark: "#004c5d",
                      contrastText: "#fff",
                  },
                  divider: grey[800],
                  background: {
                      default: grey[900],
                      paper: grey[900],
                  },
                  text: {
                      primary: "#fff",
                      secondary: grey[300],
                  },
              }),
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ ownerState }: any) => ({
                    ...(ownerState.variant === "contained" &&
                        ownerState.color === "primary" && {
                            backgroundColor: "#006d85",
                        }),
                }),
            },
        },
    },
});

export const CasTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#338a9d",
        },
        secondary: {
            main: "#f50057",
        },
        text: {
            primary: "#fff",
            secondary: grey[500],
        },
        background: {
            default: "#303030",
            paper: "#424242",
        },
    },
    typography: {
        fontFamily: [
            "Droid Sans",
            '"Segoe UI"',
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
    },
} as ThemeOptions);
