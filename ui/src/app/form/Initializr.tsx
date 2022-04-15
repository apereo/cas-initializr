import React from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Box,
    Grid,
    Divider,
    Typography
} from '@mui/material';

import Customization from './Customization';
import Dependencies from './Dependencies';


const versions = [
    '6.5.x',
    '6.4.x',
    '6.3.x',
    '6.2.x',
    '6.1.x',
    '6.0.x'
];

export default function Initializr() {

    return (
        <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{
                padding: "2rem",
            }}
        >
            <Grid item xs={6} style={{ padding: "1rem" }}>
                <Customization />
            </Grid>
            <Grid item xs={6} style={{ padding: "1rem" }}>
                <Dependencies />
            </Grid>
        </Grid>
    );
}

