import React, { Fragment } from "react";
import {
    Button,
} from "@mui/material";
import { Link } from "@mui/icons-material";
import ShareOverlayDialog from "./ShareOverlayDialog";
import { Overlay } from "../data/Overlay";
import { getOverlayQuery } from "../data/Url";
import { APP_PATH } from "../App.constant";

export interface ShareOverlayProps {
    overlay: Overlay
}

export default function ShareOverlay({ overlay }: ShareOverlayProps) {
    const [open, setOpen] = React.useState(false);

    const url = React.useMemo(
        () => `${APP_PATH}?${getOverlayQuery(overlay)}`,
        [overlay]
    );

    // React.useEffect(() => console.log(overlay), [overlay]);

    return (
        <>
            <Button
                fullWidth
                onClick={() => setOpen(true)}
                variant="contained"
                startIcon={<Link />}
            >
                Share
            </Button>
            <ShareOverlayDialog
                url={url}
                onClose={() => setOpen(false)}
                open={open} />
        </>
    );
}
