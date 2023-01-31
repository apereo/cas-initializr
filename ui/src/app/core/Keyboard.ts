import KeyboardCommandKeyIcon from "@mui/icons-material/KeyboardCommandKey";
import KeyboardControlKeyIcon from "@mui/icons-material/KeyboardControlKey";

import { useOs } from 'react-modern-hooks';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';

export interface KeyboardCommand {
    label: string;
    keys: string;
    modifier: string;
    modifierIcon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
}

export enum Action {
    EXPLORE = '[hotkey] explore',
    DOWNLOAD = '[hotkey] download',
    CLEAR = '[hotkey] clear',
    SHARE = '[hotkey] share'
}

export function useIsIOS () {
    const { os } = useOs();
    return os === 'Mac OS';
}

export function useCommand (command: Action): KeyboardCommand {
    const ios = useIsIOS();
    let label = 'NONE';
    let keys = 'space';
    let modifier = 'ctrl';
    let modifierIcon = ios ? KeyboardCommandKeyIcon : KeyboardControlKeyIcon;

    switch (command) {
        case Action.EXPLORE:
            label = `Preview`;
            modifier = ios ? "mod" : "ctrl";
            keys = `E`;
            break;
        case Action.DOWNLOAD:
            label = `Download`;
            modifier = ios ? "mod" : "ctrl";
            keys = `D`;
            break;
        case Action.SHARE:
            label = `Share`;
            modifier = ios ? "mod" : "ctrl"
            keys = `S`;
            break;
        case Action.CLEAR:
            label = `Clear`;
            modifier = ios ? "mod" : "ctrl";
            keys = `C`;
            break;
    }

    return { label, keys, modifier, modifierIcon };
}