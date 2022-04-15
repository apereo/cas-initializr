import { ThemeProvider } from '@emotion/react';
import { Box, Divider } from '@mui/material';
import { Provider } from "react-redux";
import './App.scss';
import MainAppBar from './core/navigation/MainAppBar';
import Initializr from './form/Initializr';

import { CasTheme } from './theme/CasTheme';

import { DataContext } from './core/DataContext';

import { store } from "./store/store";


function App() {

    return (
        <ThemeProvider theme={CasTheme}>
            <Provider store={store}>
                <DataContext>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100vw",
                            height: "auto",
                            minHeight: "100vh",
                            bgcolor: CasTheme.palette.background.default,
                            color: CasTheme.palette.text.primary,
                        }}
                    >
                        <MainAppBar />
                        <Divider
                            style={{
                                marginRight: "1.5rem",
                                marginLeft: "1.5rem",
                            }}
                        ></Divider>
                        <Initializr />
                    </Box>
                </DataContext>
            </Provider>
        </ThemeProvider>
    );
}

export default App;
