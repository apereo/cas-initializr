import React, { Fragment, useEffect, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import MenuIcon from "@mui/icons-material/Menu";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import MailIcon from "@mui/icons-material/Mail";
import FeedIcon from "@mui/icons-material/Feed";
import PaletteIcon from '@mui/icons-material/Palette';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ContrastIcon from '@mui/icons-material/Contrast';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import GitHubIcon from '@mui/icons-material/GitHub';
import ForestIcon from '@mui/icons-material/Forest';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import moment from 'moment';
import logo from "./cas-logo.png";
import { API_PATH } from '../../App.constant';
import { Divider, Link } from '@mui/material';
import CloseIcon from '@mui/icons-material/Menu';
import { ThemeContext } from '../../App';
import { ThemeType } from '../../theme/CasTheme';

const fetchProps = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Theme switcher component
const ThemeSwitcher = () => {
    const { currentTheme, setTheme } = useContext(ThemeContext);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleThemeChange = (theme: ThemeType) => {
        setTheme(theme);
        handleClose();
    };

    const getThemeIcon = () => {
        switch (currentTheme) {
            case 'light':       return <BrightnessHighIcon />;
            case 'dark':        return <Brightness4Icon />;
            case 'highContrast':return <ContrastIcon />;
            case 'blue':        return <InvertColorsIcon />;
            case 'solarizedLight': return <BrightnessHighIcon />;
            case 'solarizedDark':  return <Brightness4Icon />;
            case 'vscodeLight': return <BrightnessHighIcon />;
            case 'vscodeDark':  return <Brightness4Icon />;
            case 'dracula':     return <AutoAwesomeIcon />;
            case 'nord':        return <AcUnitIcon />;
            case 'githubLight': return <GitHubIcon />;
            case 'monokai':     return <ForestIcon />;
            default:            return <PaletteIcon />;
        }
    };

    const getThemeLabel = () => {
        const labels: Record<ThemeType, string> = {
            light: 'Light',
            dark: 'Dark',
            highContrast: 'High Contrast',
            blue: 'Blue',
            solarizedLight: 'Solarized Light',
            solarizedDark: 'Solarized Dark',
            vscodeLight: 'VS Code Light',
            vscodeDark: 'VS Code Dark',
            dracula: 'Dracula',
            nord: 'Nord',
            githubLight: 'GitHub Light',
            monokai: 'Monokai',
        };
        return labels[currentTheme] ?? 'Theme';
    };

    return (
        <div>
            <Tooltip title="Change theme">
                <Button
                    id="theme-button"
                    aria-controls={open ? 'theme-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    startIcon={getThemeIcon()}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                        color: 'inherit',
                        textTransform: 'none',
                        ml: 2
                    }}
                >
                    {getThemeLabel()}
                </Button>
            </Tooltip>
                <Menu
                    id="theme-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                        list: {
                            'aria-labelledby': 'theme-button',
                        },
                    }}
                >
                <MenuItem
                    onClick={() => handleThemeChange('light')}
                    selected={currentTheme === 'light'}
                >
                    <ListItemIcon>
                        <BrightnessHighIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Light</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('dark')}
                    selected={currentTheme === 'dark'}
                >
                    <ListItemIcon>
                        <Brightness4Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Dark</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('highContrast')}
                    selected={currentTheme === 'highContrast'}
                >
                    <ListItemIcon>
                        <ContrastIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>High Contrast</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('blue')}
                    selected={currentTheme === 'blue'}
                >
                    <ListItemIcon>
                        <InvertColorsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Blue</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => handleThemeChange('solarizedLight')}
                    selected={currentTheme === 'solarizedLight'}
                >
                    <ListItemIcon>
                        <BrightnessHighIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Solarized Light</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('solarizedDark')}
                    selected={currentTheme === 'solarizedDark'}
                >
                    <ListItemIcon>
                        <Brightness4Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Solarized Dark</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => handleThemeChange('vscodeLight')}
                    selected={currentTheme === 'vscodeLight'}
                >
                    <ListItemIcon>
                        <BrightnessHighIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>VS Code Light</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('vscodeDark')}
                    selected={currentTheme === 'vscodeDark'}
                >
                    <ListItemIcon>
                        <Brightness4Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>VS Code Dark</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => handleThemeChange('dracula')}
                    selected={currentTheme === 'dracula'}
                >
                    <ListItemIcon>
                        <AutoAwesomeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Dracula</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('nord')}
                    selected={currentTheme === 'nord'}
                >
                    <ListItemIcon>
                        <AcUnitIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Nord</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('githubLight')}
                    selected={currentTheme === 'githubLight'}
                >
                    <ListItemIcon>
                        <GitHubIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>GitHub Light</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleThemeChange('monokai')}
                    selected={currentTheme === 'monokai'}
                >
                    <ListItemIcon>
                        <ForestIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Monokai</ListItemText>
                </MenuItem>
            </Menu>
        </div>
    );
};

export default function MainAppBar() {
    const [open, setOpen] = React.useState(false);

    const [version, setVersion] = React.useState<string>('');
    const [date, setDate] = React.useState<string>('');

    useEffect(() => {
        initializeSystemData();
    }, []);

    async function initializeSystemData() {
        const response = await fetch(`${API_PATH}actuator/info`, fetchProps);
        if (response.ok) {
            const { build: { version, time } } = await response.json();
            setVersion(version);
            setDate(moment(new Date(time)).format('M/D/YY, H:mm A'));
        }
    }

    return (
        <Fragment>
            <AppBar position="static" elevation={0} color="transparent">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => setOpen(!open)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h4"
                        noWrap
                        component="div"
                        sx={{
                            mr: 2,
                            display: { xs: "none", md: "flex" },
                            flexGrow: 1,
                            marginBottom: 0,
                            alignItems: "center",
                        }}
                    >
                        <img src={logo} alt="CAS Logo" height="32px" />
                        &nbsp;Initializr
                    </Typography>
                    <ThemeSwitcher />
                </Toolbar>
            </AppBar>
            <Drawer anchor={"left"} open={open} onClose={() => setOpen(!open)}>
                <Box
                    sx={{
                        width: 300,
                        padding: "1rem",
                    }}
                    role="presentation"
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: '1rem'
                        }}
                    >
                        <div>
                            <Typography variant="h6" noWrap component="p">
                                CAS
                            </Typography>
                            <Typography variant="body2" noWrap component="p">
                                Central Authentication Service
                            </Typography>
                        </div>
                        <IconButton
                            aria-label="toggle drawer visibility"
                            onClick={() => setOpen(false)}
                            onMouseDown={() => setOpen(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton
                                component="a"
                                href="https://apereo.github.io/cas"
                                target="_blank"
                                rel="noopener"
                            >
                                <ListItemIcon>
                                    <InsertDriveFileIcon />
                                </ListItemIcon>
                                <ListItemText primary={"CAS Documentation"} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                component="a"
                                href="https://github.com/apereo/cas/pulls"
                                target="_blank"
                                rel="noopener"
                            >
                                <ListItemIcon>
                                    <CallMergeIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Pull Requests"} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                component="a"
                                href="https://apereo.github.io/cas/developer/Contributor-Guidelines.html"
                                target="_blank"
                                rel="noopener"
                            >
                                <ListItemIcon>
                                    <InfoIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={"Contributor Guidelines"}
                                />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                component="a"
                                href="https://apereo.github.io/cas/Support.html"
                                target="_blank"
                                rel="noopener"
                            >
                                <ListItemIcon>
                                    <HelpIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Support"} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                component="a"
                                href="https://apereo.github.io/cas/Mailing-Lists.html"
                                target="_blank"
                                rel="noopener"
                            >
                                <ListItemIcon>
                                    <MailIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Mailing Lists"} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                component="a"
                                href="https://apereo.github.io/"
                                target="_blank"
                                rel="noopener"
                            >
                                <ListItemIcon>
                                    <FeedIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Blog"} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <AppBar
                position="fixed"
                elevation={1}
                color="primary"
                sx={{ top: "auto", bottom: 0 }}
            >
                <Toolbar>
                    <Typography variant="body2" component="div" style={{display: 'block', width: '100%'}}>
                        <div style={{ display: "flex", justifyContent: 'center' }}>
                            <p>Copyright © 2005–2026 Apereo, Inc.</p>
                            <p
                                style={{
                                    marginRight: "2rem",
                                    marginLeft: "2rem",
                                }}
                            >
                                Powered by&nbsp;
                                <Link
                                    href="https://github.com/apereo/cas"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Apereo CAS
                                </Link>
                            </p>
                            <p>
                                {version} {date}
                            </p>
                        </div>
                    </Typography>
                </Toolbar>
            </AppBar>
        </Fragment>
    );
}
