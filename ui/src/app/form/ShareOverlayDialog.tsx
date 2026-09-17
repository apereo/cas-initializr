import * as React from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { Box, DialogActions, DialogContent, DialogContentText, IconButton, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import CopyAllIcon from '@mui/icons-material/CopyAll';
import useCopyToClipboard from "../core/UseCopyToClipboard";
import { useIsCompact } from "../core/useBreakpoints";

export interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
    uiUrl: string;
    curlUrl: string;
    httpieUrl: string;
    wgetUrl: string;
}

function a11yProps(index: number) {
    return {
      id: `tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        >
        {value === index && (
            <Box sx={{ py: { xs: 2, sm: 3 } }}>
                <Typography component="div">{children}</Typography>
            </Box>
        )}
        </div>
    );
}

export default function ShareOverlayDialog({ onClose, open, uiUrl, curlUrl, httpieUrl, wgetUrl }: SimpleDialogProps) {
    /*eslint-disable @typescript-eslint/no-unused-vars*/
    const copy = useCopyToClipboard();

    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback((url: string) => {
        copy(url);
        setCopied(true);
    }, [copy, setCopied]);

    React.useEffect(() => {
        if (!open) {
            setCopied(false);
        }
    }, [open]);

    const [tab, setTab] = React.useState(0);
    const isCompact = useIsCompact();

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    return (
        <Dialog
            onClose={onClose}
            open={open}
            fullWidth
            maxWidth="sm"
            fullScreen={isCompact}
            slotProps={{
                paper: {
                    sx: {
                        m: { xs: 0, sm: 4 },
                        width: { xs: "100%", sm: "calc(100% - 64px)" },
                    },
                },
            }}
        >
            <DialogTitle sx={{ px: { xs: 2, sm: 3 } }}>
                Share your configuration
            </DialogTitle>
            <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
                <DialogContentText id="alert-dialog-description">
                    Use this link to share the current configuration. Attributes
                    can be removed from the URL if you want to rely on our
                    defaults.
                </DialogContentText>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                    <Tabs
                        value={tab}
                        onChange={handleChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        aria-label="share command tabs"
                    >
                        <Tab label="Curl" {...a11yProps(0)} />
                        <Tab label="HTTPie" {...a11yProps(1)} />
                        <Tab label="wget" {...a11yProps(2)} />
                        <Tab label="Web" {...a11yProps(3)} />
                    </Tabs>
                </Box>
                <TabPanel value={tab} index={0}>
                    <FormControl sx={{ mt: 2, width: "100%", minWidth: 0 }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-url">
                            Configuration Url
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-url"
                            value={curlUrl}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Tooltip
                                        open={copied}
                                        title="Copied!"
                                        arrow
                                        placement="top"
                                    >
                                        <IconButton
                                            aria-label="copy url"
                                            onClick={() => handleCopy(curlUrl)}
                                            edge="end"
                                        >
                                            <CopyAllIcon />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            label="Configuration Url"
                            readOnly
                            sx={{
                                "& input": {
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    textOverflow: "ellipsis",
                                },
                            }}
                        />
                    </FormControl>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <FormControl sx={{ mt: 2, width: "100%", minWidth: 0 }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-url">
                            Configuration Url
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-url"
                            value={httpieUrl}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Tooltip
                                        open={copied}
                                        title="Copied!"
                                        arrow
                                        placement="top"
                                    >
                                        <IconButton
                                            aria-label="copy url"
                                            onClick={() => handleCopy(httpieUrl)}
                                            edge="end"
                                        >
                                            <CopyAllIcon />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            label="Configuration Url"
                            readOnly
                            sx={{
                                "& input": {
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    textOverflow: "ellipsis",
                                },
                            }}
                        />
                    </FormControl>
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <FormControl sx={{ mt: 2, width: "100%", minWidth: 0 }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-url">
                            Configuration Url
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-url"
                            value={wgetUrl}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Tooltip
                                        open={copied}
                                        title="Copied!"
                                        arrow
                                        placement="top"
                                    >
                                        <IconButton
                                            aria-label="copy url"
                                            onClick={() => handleCopy(wgetUrl)}
                                            edge="end"
                                        >
                                            <CopyAllIcon />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            label="Configuration Url"
                            readOnly
                            sx={{
                                "& input": {
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    textOverflow: "ellipsis",
                                },
                            }}
                        />
                    </FormControl>
                </TabPanel>
                <TabPanel value={tab} index={3}>
                    <FormControl sx={{ mt: 2, width: "100%", minWidth: 0 }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-url">
                            Configuration Url
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-url"
                            value={uiUrl}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Tooltip
                                        open={copied}
                                        title="Copied!"
                                        arrow
                                        placement="top"
                                    >
                                        <IconButton
                                            aria-label="copy url"
                                            onClick={() => handleCopy(uiUrl)}
                                            edge="end"
                                        >
                                            <CopyAllIcon />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            label="Configuration Url"
                            readOnly
                            sx={{
                                "& input": {
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    textOverflow: "ellipsis",
                                },
                            }}
                        />
                    </FormControl>
                </TabPanel>
            </DialogContent>
            <DialogActions
                sx={{
                    px: { xs: 2, sm: 3 },
                    pb: { xs: "calc(12px + env(safe-area-inset-bottom))", sm: 1 },
                }}
            >
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        minHeight: 44,
                        width: { xs: "100%", sm: "auto" },
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

