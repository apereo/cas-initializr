import { ThemeProvider } from '@emotion/react';
import { Box, Grid, Divider, Typography } from '@mui/material';
import './App.scss';
import MainAppBar from './core/navigation/MainAppBar';
import Initializr from './form/Initializr';
import Dependencies from './form/Dependencies';
import { CasTheme } from "./theme/CasTheme";

function App() {
    return (
        <ThemeProvider theme={CasTheme}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100vw",
                    height: "auto",
                    bgcolor: CasTheme.palette.background.default,
                    color: CasTheme.palette.text.primary,
                }}
            >
                <MainAppBar />
                <Divider
                    style={{ marginRight: "1.5rem", marginLeft: "1.5rem" }}
                ></Divider>
                <Grid
                    container
                    rowSpacing={1}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    sx={{
                        padding: "2rem",
                    }}
                >
                    <Grid item xs={6} style={{ padding: "1rem" }}>
                        <Typography variant="subtitle1">
                            Customization
                        </Typography>
                        <Initializr />
                    </Grid>
                    <Grid item xs={6} style={{ padding: "1rem" }}>
                        <Typography variant="subtitle1">
                            Dependencies
                        </Typography>
                        <Dependencies />
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default App;
