
import React, { Fragment } from "react";
import { Button } from "@mui/material";
import { Action, useCommand } from "../core/Keyboard";
import { Download } from "@mui/icons-material";
import { useHotkeys } from "react-hotkeys-hook";

export interface PreviewProps {
    handleDownload: () => void;
    disabled: boolean;
}

export default function DownloadOverlay({ handleDownload, disabled }: PreviewProps) {
    const { label, keys } = useCommand(Action.DOWNLOAD);

    useHotkeys(keys, () => handleDownload(), { preventDefault: true }, [keys]);

    // React.useEffect(() => console.log(overlay), [overlay]);

    return (
        <>
            <Button
                fullWidth
                variant="contained"
                type="submit"
                onClick={() => handleDownload()}
                disabled={disabled}
                startIcon={<Download />}
            >
                {label}
            </Button>
        </>
    );
}
