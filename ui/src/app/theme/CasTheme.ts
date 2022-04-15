import { grey } from '@mui/material/colors';
import { ThemeOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

export const CasTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#006d85",
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
