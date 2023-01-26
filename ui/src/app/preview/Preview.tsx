import React from "react";
import { Breadcrumbs, Button, Drawer } from "@mui/material";

import { setPreviewState, useIsPreviewing, usePreviewSelected } from "../store/PreviewReducer";
import { useAppDispatch } from "../store/hooks";
import { Download, NavigateNext, VisibilitySharp } from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Tree } from "./Tree";
import { Code } from "./Code";
import { Box } from "@mui/system";
import { Action, useCommand } from "../core/Keyboard";
import { useHotkeys } from "react-hotkeys-hook";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export interface PreviewProps {
    handleDownload: () => void;
    handlePreview: () => void;
}

export function Preview({ handleDownload, handlePreview }: PreviewProps) {
    const dispatch = useAppDispatch();
    const open = useIsPreviewing();

    const selected = usePreviewSelected();
    const name = React.useMemo(() => selected?.path.split("/"), [selected]);

    const handleClose = () => {
        dispatch(setPreviewState(false));
    };

    const drawerWidth: string = '25%';

    const { label, keys } = useCommand(
        Action.EXPLORE
    );

    useHotkeys(keys, () => handlePreview(), [keys]);

    return (
        <>
            <Button
                fullWidth
                onClick={() => handlePreview()}
                variant="contained"
                startIcon={<VisibilitySharp />}
            >
                { label }
            </Button>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <Box sx={{ display: "flex" }}>
                    <Drawer
                        sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                            "& .MuiDrawer-paper": {
                                width: drawerWidth,
                                boxSizing: "border-box",
                            },
                        }}
                        variant="permanent"
                        anchor="left"
                    >
                        <AppBar sx={{ position: "relative" }}>
                            <Toolbar
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Button
                                    autoFocus
                                    color="inherit"
                                    onClick={handleDownload}
                                >
                                    <Download />
                                    &nbsp; Download
                                </Button>
                            </Toolbar>
                        </AppBar>
                        <Tree />
                    </Drawer>
                    <Box
                        sx={{
                            flexGrow: 1,
                        }}
                    >
                        <AppBar sx={{ position: "relative" }}>
                            <Toolbar
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Breadcrumbs
                                        aria-label="breadcrumb"
                                        style={{ marginTop: "0rem" }}
                                        separator={
                                            <NavigateNext fontSize="large" />
                                        }
                                    >
                                        {name?.map((i) => (
                                            <Typography
                                                color="text.primary"
                                                variant={"h6"}
                                                key={i}
                                            >
                                                {i}
                                            </Typography>
                                        ))}
                                    </Breadcrumbs>
                                </Box>
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    onClick={handleClose}
                                    aria-label="close"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Toolbar>
                        </AppBar>
                        <Code />
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}
