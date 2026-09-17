import React, { Fragment } from "react";
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useShowShortcuts } from "../core/useBreakpoints";

export interface ShortcutHintProps {
    modifierIcon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
    keys: string;
}

/**
 * Renders the " (⌘+D)" suffix appended to action button labels.
 *
 * Keyboard shortcuts are unreachable on a phone or tablet, and the suffix is
 * wide enough to force button labels to wrap there, so it is rendered only on
 * pointer devices with enough room for it.
 */
export default function ShortcutHint({ modifierIcon, keys }: ShortcutHintProps) {
    const showShortcuts = useShowShortcuts();

    if (!showShortcuts) {
        return null;
    }

    return (
        <Fragment>
            &nbsp;(
            {React.createElement(modifierIcon, { fontSize: "small" })}+{keys})
        </Fragment>
    );
}
