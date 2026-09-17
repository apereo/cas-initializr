import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Shared responsive helpers so every component agrees on what "mobile" means.
 *
 * - `useIsMobile()`  — below `md` (< 900px): phones and small tablets in
 *   portrait. This is the breakpoint where the two-column layout collapses.
 * - `useIsCompact()` — below `sm` (< 600px): phones. Used for the tightest
 *   adjustments (icon-only buttons, dropped label suffixes).
 * - `useIsTouch()`   — the pointer is coarse, i.e. there is no hover. Keyboard
 *   shortcut hints and hover-only affordances are pointless here.
 */
export function useIsMobile(): boolean {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
}

export function useIsCompact(): boolean {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
}

export function useIsTouch(): boolean {
    return useMediaQuery("(hover: none) and (pointer: coarse)", { noSsr: true });
}

/** True when keyboard-shortcut hints should be shown at all. */
export function useShowShortcuts(): boolean {
    const isMobile = useIsMobile();
    const isTouch = useIsTouch();
    return !isMobile && !isTouch;
}
