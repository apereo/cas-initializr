import * as React from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogActions, DialogContent, DialogContentText, IconButton, Tooltip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import { CopyAll } from "@mui/icons-material";
import useCopyToClipboard from "../core/UseCopyToClipboard";

export interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
    url: string;
}

export default function ShareOverlayDialog({ onClose, open, url }: SimpleDialogProps) {
    /*eslint-disable @typescript-eslint/no-unused-vars*/
    const [value, copy] = useCopyToClipboard();

    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback(() => {
        copy(url);
        setCopied(true);
    }, [copy, setCopied, url]);

    React.useEffect(() => {
        if (!open) {
            setCopied(false);
        }
    }, [open]);

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>Share your configuration</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Use this link to share the current configuration. Attributes
                    can be removed from the URL if you want to rely on our
                    defaults.
                </DialogContentText>
                <FormControl sx={{ mt: 2, width: "100%" }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-url">
                        Configuration Url
                    </InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-url"
                        value={url}
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
                                        onClick={() => handleCopy()}
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
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

