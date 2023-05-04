import * as React from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { Box, DialogActions, DialogContent, DialogContentText, IconButton, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import { CopyAll } from "@mui/icons-material";
import useCopyToClipboard from "../core/UseCopyToClipboard";

export interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
    uiUrl: string;
    curlUrl: string;
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
            <Box sx={{ py: 3 }}>
                <Typography>{children}</Typography>
            </Box>
        )}
        </div>
    );
}

export default function ShareOverlayDialog({ onClose, open, uiUrl, curlUrl }: SimpleDialogProps) {
    /*eslint-disable @typescript-eslint/no-unused-vars*/
    const [value, copy] = useCopyToClipboard();

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

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>Share your configuration</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Use this link to share the current configuration. Attributes
                    can be removed from the URL if you want to rely on our
                    defaults.
                </DialogContentText>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Curl" {...a11yProps(0)} />
                        <Tab label="Configuration UI" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <TabPanel value={tab} index={0}>
                    <FormControl sx={{ mt: 2, width: "100%" }} variant="outlined">
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
                                            <CopyAll />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            label="Configuration Url"
                        />
                    </FormControl>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <FormControl sx={{ mt: 2, width: "100%" }} variant="outlined">
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
                                            <CopyAll />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            label="Configuration Url"
                        />
                    </FormControl>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

