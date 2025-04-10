import React, { useEffect } from 'react';
import {
    ThemeProvider,
    createTheme,
} from "@mui/material/styles";
import { Box, Divider, Grid } from '@mui/material';
import { Provider } from "react-redux";

import './App.scss';
import MainAppBar from './core/navigation/MainAppBar';
import Initializr from './form/Initializr';
import { getDesignTokens, ThemeType } from "./theme/CasTheme";
import { DataContext } from './core/DataContext';
import { store } from "./store/store";

// Create a context for theme management
interface ThemeContextType {
    currentTheme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
    currentTheme: 'dark',
    setTheme: () => {},
});

// Helper function to validate if a theme is valid
const isValidTheme = (theme: string): theme is ThemeType => {
    return ['light', 'dark', 'highContrast', 'blue', 'solarizedLight', 'solarizedDark', 'vscodeLight', 'vscodeDark'].includes(theme as ThemeType);
};

// Local storage key for theme
const THEME_STORAGE_KEY = 'cas-initializr-theme';

function App() {
    // Initialize theme from localStorage or fall back to default
    const [currentTheme, setCurrentTheme] = React.useState<ThemeType>(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        // Check if the saved theme is valid, otherwise use default
        return savedTheme && isValidTheme(savedTheme) ? savedTheme as ThemeType : "dark";
    });

    // Save theme to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    }, [currentTheme]);

    const themeContextValue = React.useMemo(
        () => ({
            currentTheme,
            setTheme: (theme: ThemeType) => {
                setCurrentTheme(theme);
                // No need to set localStorage here as the useEffect will handle it
            },
        }),
        [currentTheme]
    );

    // Update the theme only if the theme type changes
    const theme = React.useMemo(
        () => createTheme(getDesignTokens(currentTheme)),
        [currentTheme]
    );

    return (
        <ThemeContext.Provider value={themeContextValue}>
            <ThemeProvider theme={theme}>
                <Provider store={store}>
                    <DataContext>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100vw",
                                height: "auto",
                                minHeight: "100vh",
                                bgcolor: theme.palette.background.default,
                                color: theme.palette.text.primary,
                            }}
                        >
                            <Grid
                                container
                                direction="column"
                                alignItems="center"
                                spacing={2}
                            >
                                <Grid size={12}>
                                    <MainAppBar />
                                    <Divider
                                        style={{
                                            marginRight: "1.5rem",
                                            marginLeft: "1.5rem",
                                        }}
                                    ></Divider>
                                    <Initializr />
                                </Grid>
                            </Grid>
                        </Box>
                    </DataContext>
                </Provider>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export default App;
