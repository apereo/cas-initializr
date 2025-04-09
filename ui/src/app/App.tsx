import React from 'react';
import {
    ThemeProvider,
    createTheme,
} from "@mui/material/styles";
import { Box, Divider, Grid } from '@mui/material';
import { Provider } from "react-redux";

import './App.scss';
import MainAppBar from './core/navigation/MainAppBar';
import Initializr from './form/Initializr';
import { getDesignTokens, CasTheme, ThemeType } from "./theme/CasTheme";
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

function App() {
    const [currentTheme, setCurrentTheme] = React.useState<ThemeType>("dark");

    const themeContextValue = React.useMemo(
        () => ({
            currentTheme,
            setTheme: (theme: ThemeType) => {
                setCurrentTheme(theme);
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
