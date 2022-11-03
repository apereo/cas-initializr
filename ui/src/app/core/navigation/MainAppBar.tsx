import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function MainAppBar() {
    return (
        <AppBar position='static' elevation={0} color='transparent'>
            <Toolbar>
                <IconButton
                    size='large'
                    edge='start'
                    color='inherit'
                    aria-label='menu'
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography
                    variant='h4'
                    noWrap
                    component='div'
                    sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        flexGrow: 1,
                        marginBottom: 0,
                        alignItems: 'center',
                    }}
                >
                    <img
                        src={`/images/cas-logo.png`}
                        alt='CAS Logo'
                        height='32px'
                    />
                    &nbsp;Initializr
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
