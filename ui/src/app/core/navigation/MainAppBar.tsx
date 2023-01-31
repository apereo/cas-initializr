import React, { Fragment, useEffect } from 'react';
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

import MenuIcon from "@mui/icons-material/Menu";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import MailIcon from "@mui/icons-material/Mail";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import FeedIcon from "@mui/icons-material/Feed";

import moment from 'moment';

import logo from "./cas-logo.png";
import { API_PATH } from '../../App.constant';
import { Divider, Link } from '@mui/material';
import { Close } from '@mui/icons-material';

const fetchProps = {
    headers: {
        "Content-Type": "application/json",
    },
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
                            <Close />
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
                                href="https://gitter.im/apereo/cas"
                                target="_blank"
                                rel="noopener"
                            >
                                <ListItemIcon>
                                    <QuestionAnswerIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Chatroom"} />
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
                            <p>Copyright © 2005–2023 Apereo, Inc.</p>
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
