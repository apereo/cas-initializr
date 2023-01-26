import React from 'react';

import KeyboardCommandKeyIcon from "@mui/icons-material/KeyboardCommandKey";
import KeyboardControlKeyIcon from "@mui/icons-material/KeyboardControlKey";

import { useOs } from 'react-modern-hooks';

export interface KeyboardCommand {
    label: string;
    keys: string;
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
    let label = 'NONE';
    let keys = 'space';

    const ios = useIsIOS();

    switch (command) {
        case Action.EXPLORE:
            label = `Preview (${ios ? "cmd" : "ctrl"}+E)`;
            keys = `${ios ? "mod" : "ctrl"}+E`;
            break;
        case Action.DOWNLOAD:
            label = `Download (${ios ? "cmd" : "ctrl"}+enter)`;
            keys = `${ios ? "mod" : "ctrl"}+enter`;
            break;
        case Action.SHARE:
            label = `Share (${ios ? "cmd" : "ctrl"}+S)`;
            keys = `${ios ? "mod" : "ctrl"}+S`;
            break;
        case Action.CLEAR:
            label = `Clear (${ios ? "cmd" : "ctrl"}+D)`;
            keys = `${ios ? "mod" : "ctrl"}+D`;
            break;
    }

    return { label, keys };
}