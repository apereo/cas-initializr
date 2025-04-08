import React, { Fragment } from "react";
import {
    Button,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import ShareOverlayDialog from "./ShareOverlayDialog";
import { Overlay } from "../data/Overlay";
import { getOverlayQuery } from "../data/Url";
import { API_PATH, APP_ORIGIN, APP_PATH } from "../App.constant";
import { Action, useCommand } from "../core/Keyboard";
import { useHotkeys } from "react-hotkeys-hook";

export interface ShareOverlayProps {
    overlay: Overlay;
    disabled: boolean;
}

export default function ShareOverlay({ overlay, disabled }: ShareOverlayProps) {
    const [open, setOpen] = React.useState(false);

    const type: string = "tgz";

    const uiUrl = React.useMemo(
        () => `${APP_PATH}/ui?${getOverlayQuery(overlay)}`,
        [overlay]
    );

    const curlUrl = React.useMemo(
        () => `curl "${APP_ORIGIN}${API_PATH}starter.${type}?${getOverlayQuery(overlay)}" | tar -xzvf -`,
        [overlay]
    );

    const { label, keys, modifier, modifierIcon } = useCommand(Action.SHARE);

    useHotkeys(`${modifier}+${keys}`, () => setOpen(true), {preventDefault: true}, [keys]);

    React.useEffect(() => console.log(overlay), [overlay]);

    return (
        <>
            <Button
                fullWidth
                onClick={() => setOpen(true)}
                variant="contained"
                disabled={disabled}
                startIcon={<LinkIcon />}
            >
                {label} ({React.createElement(modifierIcon, {fontSize: 'small'})}+{keys})
            </Button>
            <ShareOverlayDialog
                uiUrl={ uiUrl }
                curlUrl={ curlUrl }
                onClose={() => setOpen(false)}
                open={open}
            />
        </>
    );
}
