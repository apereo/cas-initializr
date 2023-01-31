import React from 'react';
import {
    ThemeProvider,
    createTheme,
} from "@mui/material/styles";
import { Box, Divider, Grid, PaletteMode } from '@mui/material';
import { Provider } from "react-redux";

import './App.scss';
import MainAppBar from './core/navigation/MainAppBar';
import Initializr from './form/Initializr';
import { getDesignTokens, CasTheme } from "./theme/CasTheme";
import { DataContext } from './core/DataContext';
import { store } from "./store/store";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function App() {
    const [mode, setMode] = React.useState<PaletteMode>("dark");
    const colorMode = React.useMemo(
        () => ({
            // The dark mode switch would invoke this method
            toggleColorMode: () => {
                setMode((prevMode: PaletteMode) =>
                    prevMode === "light" ? "dark" : "light"
                );
            },
        }),
        []
    );

    // Update the theme only if the mode changes
    const theme = React.useMemo(
        () => createTheme(getDesignTokens(mode)),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
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
                                color: CasTheme.palette.text.primary,
                            }}
                        >
                            <Grid
                                container
                                direction="column"
                                alignItems="center"
                            >
                                <Grid item xs={12}>
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
        </ColorModeContext.Provider>
    );
}

export default App;
