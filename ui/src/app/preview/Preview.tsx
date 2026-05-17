import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button, Dialog, GlobalStyles } from "@mui/material";
import {
    setPreviewSelected,
    setPreviewState,
    useIsPreviewing,
    usePreviewSelected,
    usePreviewTree,
} from "../store/PreviewReducer";
import { useAppDispatch } from "../store/hooks";
import VisibilitySharp from "@mui/icons-material/VisibilitySharp";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Tree } from "./Tree";
import { Code } from "./Code";
import { FileTypeIcon } from "./FileTypeIcon";
import { Action, useCommand } from "../core/Keyboard";
import { useHotkeys } from "react-hotkeys-hook";
import { FileTreeItem } from "../file/tree";
import Fuse from "fuse.js";

/* ── VS Code colour tokens ─────────────────────────────────────── */
const VS = {
    titleBar: "#3c3c3c",
    activityBar: "#333333",
    activityIcon: "#858585",
    activityIconActive: "#ffffff",
    sidebar: "#252526",
    sidebarHeader: "#252526",
    sidebarHeaderFg: "#bdbdbd",
    editor: "#1e1e1e",
    tabBar: "#2d2d2d",
    tabActive: "#1e1e1e",
    tabInactive: "#2d2d2d",
    tabActiveFg: "#ffffff",
    tabInactiveFg: "#969696",
    tabActiveBorder: "#007acc",
    tabHover: "#3d3d3d",
    statusBar: "#007acc",
    statusBarFg: "#ffffff",
    border: "#474747",
    iconBtn: "transparent",
    iconBtnHover: "rgba(255,255,255,0.1)",
};

const MIN_FONT = 8;
const MAX_FONT = 32;
const DEFAULT_FONT = 14;

/** Font stack that matches Monaco editor's default */
const EDITOR_FONT = "'Comic Mono', 'Ubuntu', Consolas, 'Courier New', monospace";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

/* ── Small helper: icon button styled for VS Code look ─────────── */
function VsIconBtn({
    title,
    onClick,
    disabled,
    children,
}: {
    title: string;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    const [hov, setHov] = useState(false);
    return (
        <button
            title={title}
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: hov && !disabled ? VS.iconBtnHover : VS.iconBtn,
                border: "none",
                color: disabled ? "#555" : VS.statusBarFg,
                cursor: disabled ? "default" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6px",
                height: "100%",
                fontSize: 18,
                borderRadius: 3,
                transition: "background 0.1s",
            }}
        >
            {children}
        </button>
    );
}

export interface PreviewProps {
    handleDownload: () => void;
    handlePreview: () => void;
    disabled: boolean;
}

export function Preview({ handleDownload, handlePreview, disabled }: PreviewProps) {
    const dispatch = useAppDispatch();
    const open = useIsPreviewing();
    const selected = usePreviewSelected();

    /* ── Local state ────────────────────────────────────────────── */
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [openTabs, setOpenTabs] = useState<FileTreeItem[]>([]);
    const [tabContextMenu, setTabContextMenu] = useState<{ path: string; x: number; y: number } | null>(null);
    const [fontSize, setFontSize] = useState<number>(() => {
        const saved = localStorage.getItem("cas-initializr-preview-font-size");
        const parsed = saved ? parseInt(saved, 10) : NaN;
        return isNaN(parsed) ? DEFAULT_FONT : Math.min(MAX_FONT, Math.max(MIN_FONT, parsed));
    });
    const [quickOpenVisible, setQuickOpenVisible] = useState(false);
    const [minimapEnabled, setMinimapEnabled] = useState(true);
    const [wordWrapEnabled, setWordWrapEnabled] = useState(true);
    const [markdownPreview, setMarkdownPreview] = useState(false);

    /* ── Sidebar resize drag ─────────────────────────────────────── */
    const MIN_SIDEBAR = 140;
    const MAX_SIDEBAR = 600;
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragStartWidth = useRef(0);

    const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        dragStartX.current = e.clientX;
        dragStartWidth.current = sidebarWidth;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }, [sidebarWidth]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = e.clientX - dragStartX.current;
            const next = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, dragStartWidth.current + delta));
            setSidebarWidth(next);
        };
        const onUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
    }, []);

    /* ── Flat file list for Quick Open ──────────────────────────── */
    const tree = usePreviewTree();
    const flatFiles = useMemo(() => flattenTree(tree ?? []), [tree]);
    const fuse = useMemo(
        () => new Fuse(flatFiles, { keys: ["name", "path"], threshold: 0.4 }),
        [flatFiles]
    );

    /* Keep tabs in sync with selected file ───────────────────── */
    useEffect(() => {
        if (selected && selected.type !== "dir") {
            setOpenTabs((prev) => {
                if (prev.some((t) => t.path === selected.path)) return prev;
                return [...prev, selected];
            });
            // reset markdown preview when switching to a non-markdown file
            if (selected.type !== "markdown") setMarkdownPreview(false);
        }
    }, [selected]);

    /* Persist font size to localStorage ────────────────────────── */
    useEffect(() => {
        localStorage.setItem("cas-initializr-preview-font-size", String(fontSize));
    }, [fontSize]);

    /* Reset tabs when dialog closes ──────────────────────────── */
    useEffect(() => {
        if (!open) {
            setOpenTabs([]);
        }
    }, [open]);

    const handleClose = useCallback(() => {
        dispatch(setPreviewState(false));
    }, [dispatch]);

    const handleDownloadFile = useCallback(() => {
        if (!selected || selected.type === "dir" || !selected.content) return;
        const blob = new Blob([selected.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selected.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [selected]);

    const closeTab = useCallback(
        (path: string) => {
            setOpenTabs((prev) => {
                const next = prev.filter((t) => t.path !== path);
                if (selected?.path === path) {
                    const idx = prev.findIndex((t) => t.path === path);
                    const fallback = next[idx] ?? next[idx - 1] ?? next[0] ?? null;
                    dispatch(setPreviewSelected(fallback));
                }
                return next;
            });
        },
        [selected, dispatch]
    );

    const closeAllTabs = useCallback(() => {
        setOpenTabs([]);
        dispatch(setPreviewSelected(null));
    }, [dispatch]);

    const closeTabsToRight = useCallback((path: string) => {
        setOpenTabs((prev) => {
            const idx = prev.findIndex((t) => t.path === path);
            if (idx < 0) return prev;
            const next = prev.slice(0, idx + 1);
            // if selected tab was to the right, switch to this tab
            if (selected && !next.some((t) => t.path === selected.path)) {
                const pivot = next[next.length - 1];
                if (pivot) dispatch(setPreviewSelected(pivot));
            }
            return next;
        });
    }, [selected, dispatch]);

    const tabScrollRef = useRef<HTMLDivElement>(null);

    const onTabWheel = useCallback((e: React.WheelEvent) => {
        const el = tabScrollRef.current;
        if (!el) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
    }, []);

    /* Scroll active tab into view when selection changes ─────── */
    useEffect(() => {
        if (!selected || !tabScrollRef.current) return;
        const el = tabScrollRef.current.querySelector<HTMLDivElement>(`[data-tabpath="${CSS.escape(selected.path)}"]`);
        el?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [selected]);

    const { modifier: qoModifier, keys: qoKeys } = useCommand(Action.QUICK_OPEN);
    const { label, keys, modifier, modifierIcon } = useCommand(Action.EXPLORE);
    const { modifier: ctModifier, keys: ctKeys } = useCommand(Action.CLOSE_TAB);

    useHotkeys(
        `${modifier}+${keys}`,
        () => handlePreview(),
        { preventDefault: true },
        [keys, handlePreview]
    );

    useHotkeys(
        `${qoModifier}+${qoKeys}`,
        () => { if (open) setQuickOpenVisible((v) => !v); },
        { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true },
        [open]
    );

    useHotkeys(
        `${qoModifier}+shift+v`,
        () => { if (open && selected?.type === "markdown") setMarkdownPreview((v) => !v); },
        { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true },
        [open, selected]
    );

    useHotkeys(
        `${ctModifier}+${ctKeys}`,
        () => { if (open && selected) closeTab(selected.path); },
        { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true },
        [open, selected, closeTab]
    );

    useHotkeys(
        `alt+shift+w`,
        () => { if (open) closeAllTabs(); },
        { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true },
        [open, closeAllTabs]
    );

    /* ── Render trigger button (outside dialog) ─────────────── */
    return (
        <>
            <Button
                fullWidth
                onClick={() => handlePreview()}
                variant="contained"
                startIcon={<VisibilitySharp />}
                disabled={disabled}
            >
                {label} ({React.createElement(modifierIcon, { fontSize: "small" })}+{keys})
            </Button>

            <Dialog
                fullScreen
                open={open}
                onClose={(_event, reason) => {
                    if (reason === "escapeKeyDown") handleClose();
                }}
                slots={{ transition: Transition }}
                slotProps={{ paper: { style: { background: VS.editor, overflow: "hidden" } } }}
                disableEnforceFocus
                disableAutoFocus
                disableRestoreFocus
            >
                {/* ── VS Code Shell ─────────────────────────────────── */}
                <div
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    fontFamily: EDITOR_FONT,
                    overflow: "hidden",
                    }}
                >
                    <GlobalStyles styles={{ ".vs-tabs-scroll::-webkit-scrollbar": { display: "none" } }} />
                    {/* ── Menu bar (replaces title bar) ─────────────── */}
                    <MenuBar
                        sidebarOpen={sidebarOpen}
                        minimapEnabled={minimapEnabled}
                        wordWrapEnabled={wordWrapEnabled}
                        fontSize={fontSize}
                        minFont={MIN_FONT}
                        maxFont={MAX_FONT}
                        defaultFont={DEFAULT_FONT}
                        hasFile={!!(selected && selected.type !== "dir" && selected.content)}
                        onToggleSidebar={() => setSidebarOpen((v) => !v)}
                        onToggleMinimap={() => setMinimapEnabled((v) => !v)}
                        onToggleWordWrap={() => setWordWrapEnabled((v) => !v)}
                        isMarkdown={selected?.type === "markdown"}
                        markdownPreview={markdownPreview}
                        onToggleMarkdownPreview={() => setMarkdownPreview((v) => !v)}
                        onIncreaseFontSize={() => setFontSize((f) => Math.min(f + 1, MAX_FONT))}
                        onDecreaseFontSize={() => setFontSize((f) => Math.max(f - 1, MIN_FONT))}
                        onResetFontSize={() => setFontSize(DEFAULT_FONT)}
                        onGoToFile={() => setQuickOpenVisible(true)}
                        onDownloadOverlay={handleDownload}
                        onDownloadFile={handleDownloadFile}
                        onCloseTab={() => selected && closeTab(selected.path)}
                        onCloseAllTabs={closeAllTabs}
                        onClose={handleClose}
                    />

                    {/* ── Middle: activity bar + sidebar + editor ────── */}
                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            overflow: "hidden",
                        }}
                    >
                        {/* Activity bar */}
                        <div
                            style={{
                                width: 48,
                                background: VS.activityBar,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                paddingTop: 4,
                                flexShrink: 0,
                                borderRight: `1px solid ${VS.border}`,
                            }}
                        >
                            <ActivityBarIcon
                                title="Explorer"
                                active={sidebarOpen}
                                onClick={() => setSidebarOpen((v) => !v)}
                            >
                                {/* Files icon */}
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M13 5H7v2h6V5zm0 4H7v2h6V9zm0 4H7v2h6v-2zm4-8h-2V3H5v18h14V5zm-2 14H7v-2h8v2zm2-4H7v-2h10v2z" />
                                </svg>
                            </ActivityBarIcon>
                        </div>

                        {/* Sidebar — Explorer */}
                        {sidebarOpen && (
                            <div
                                style={{
                                    width: sidebarWidth,
                                    minWidth: sidebarWidth,
                                    background: VS.sidebar,
                                    display: "flex",
                                    flexDirection: "column",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                {/* Explorer header */}
                                <div
                                    style={{
                                        padding: "10px 12px 6px 20px",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: VS.sidebarHeaderFg,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        flexShrink: 0,
                                        fontFamily: EDITOR_FONT,
                                    }}
                                >
                                    Explorer
                                </div>
                                {/* File tree */}
                                <div
                                    style={{
                                        flex: 1,
                                        overflowY: "auto",
                                        overflowX: "hidden",
                                    }}
                                >
                                    <Tree />
                                </div>
                                {/* Drag handle */}
                                <div
                                    onMouseDown={onResizeMouseDown}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        width: 4,
                                        height: "100%",
                                        cursor: "col-resize",
                                        background: "transparent",
                                        zIndex: 10,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = VS.tabActiveBorder)}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                />
                            </div>
                        )}

                        {/* ── Editor area ─────────────────────────────── */}
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                                background: VS.editor,
                            }}
                        >
                            {/* Tab bar */}
                            <div
                                style={{
                                    height: 46,
                                    background: VS.tabBar,
                                    display: "flex",
                                    alignItems: "stretch",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    borderBottom: `1px solid ${VS.border}`,
                                }}
                            >
                                {/* Tabs — scrollable, scrollbar hidden */}
                                <div
                                    ref={tabScrollRef}
                                    onWheel={onTabWheel}
                                    className="vs-tabs-scroll"
                                    style={{
                                        display: "flex",
                                        alignItems: "stretch",
                                        flex: 1,
                                        minWidth: 0,          /* ← lets flex child shrink so overflow:auto kicks in */
                                        overflowX: "auto",
                                        overflowY: "hidden",
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                    } as React.CSSProperties}
                                >
                                     {openTabs.map((tab) => (
                                        <Tab
                                            key={tab.path}
                                            tab={tab}
                                            isActive={tab.path === selected?.path}
                                            fontSize={fontSize}
                                            onSelect={() =>
                                                dispatch(setPreviewSelected(tab))
                                            }
                                            onClose={() => closeTab(tab.path)}
                                            onContextMenu={(x, y) => setTabContextMenu({ path: tab.path, x, y })}
                                        />
                                    ))}
                                </div>

                                {/* Markdown preview toggle — only for .md files */}
                                {selected?.type === "markdown" && (
                                    <div style={{ display: "flex", alignItems: "center", borderLeft: `1px solid ${VS.border}`, paddingLeft: 8, paddingRight: 4 }}>
                                        <VsIconBtn
                                            title={`${markdownPreview ? "Open Source" : "Open Preview"} (Ctrl+Shift+V)`}
                                            onClick={() => setMarkdownPreview((v) => !v)}
                                        >
                                            {markdownPreview ? (
                                                /* code/source icon */
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                                                </svg>
                                            ) : (
                                                /* eye/preview icon */
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </VsIconBtn>
                                        <span style={{ color: markdownPreview ? VS.tabActiveBorder : "#858585", fontSize: 11, paddingRight: 4 }}>
                                            {markdownPreview ? "Preview" : "Source"}
                                        </span>
                                    </div>
                                )}
                                {/* Font size controls */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        paddingRight: 8,
                                        flexShrink: 0,
                                        borderLeft: `1px solid ${VS.border}`,
                                        paddingLeft: 8,
                                    }}
                                >
                                    <VsIconBtn
                                        title="Increase font size"
                                        onClick={() =>
                                            setFontSize((f) =>
                                                Math.min(f + 1, MAX_FONT)
                                            )
                                        }
                                        disabled={fontSize >= MAX_FONT}
                                    >
                                        <span style={{ fontSize: 14, fontWeight: "bold" }}>A+</span>
                                    </VsIconBtn>
                                    <span
                                        style={{
                                            color: "#858585",
                                            fontSize: 11,
                                            minWidth: 28,
                                            textAlign: "center",
                                        }}
                                    >
                                        {fontSize}px
                                    </span>
                                    <VsIconBtn
                                        title="Decrease font size"
                                        onClick={() =>
                                            setFontSize((f) =>
                                                Math.max(f - 1, MIN_FONT)
                                            )
                                        }
                                        disabled={fontSize <= MIN_FONT}
                                    >
                                        <span style={{ fontSize: 14, fontWeight: "bold" }}>A-</span>
                                    </VsIconBtn>
                                    <VsIconBtn
                                        title={
                                            selected && selected.type !== "dir" && selected.content
                                                ? `Download ${selected.name}`
                                                : "No file selected"
                                        }
                                        onClick={handleDownloadFile}
                                        disabled={!selected || selected.type === "dir" || !selected.content}
                                    >
                                        <svg
                                            width="15"
                                            height="15"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                    </VsIconBtn>
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <Code fontSize={fontSize} minimap={minimapEnabled} wordWrap={wordWrapEnabled} markdownPreview={markdownPreview} />
                            </div>
                        </div>
                    </div>

                    {/* ── Status bar ──────────────────────────────────── */}
                    <div
                        style={{
                            height: 22,
                            background: VS.statusBar,
                            color: VS.statusBarFg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingLeft: 8,
                            paddingRight: 4,
                            flexShrink: 0,
                            fontSize: 12,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {selected && selected.type !== "dir" && (
                                <span style={{ textTransform: "lowercase" }}>
                                    {selected.type}
                                </span>
                            )}
                            <span>UTF-8</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                            <VsIconBtn title="Download overlay" onClick={handleDownload}>
                                {/* Download icon */}
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ marginRight: 4 }}
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span style={{ fontSize: 12 }}>Download</span>
                            </VsIconBtn>
                        </div>
                    </div>

                    {/* ── Tab context menu ────────────────────────────── */}
                    {tabContextMenu && (
                        <TabContextMenu
                            x={tabContextMenu.x}
                            y={tabContextMenu.y}
                            isLastTab={openTabs.length <= 1}
                            isRightmostTab={openTabs[openTabs.length - 1]?.path === tabContextMenu.path}
                            onClose={() => { closeTab(tabContextMenu.path); setTabContextMenu(null); }}
                            onCloseAll={() => { closeAllTabs(); setTabContextMenu(null); }}
                            onCloseToRight={() => { closeTabsToRight(tabContextMenu.path); setTabContextMenu(null); }}
                            onDismiss={() => setTabContextMenu(null)}
                        />
                    )}

                    {/* ── Quick Open overlay ───────────────────────────── */}
                    {quickOpenVisible && (
                        <QuickOpen
                            fuse={fuse}
                            allFiles={flatFiles}
                            onSelect={(item) => {
                                dispatch(setPreviewSelected(item));
                                setQuickOpenVisible(false);
                            }}
                            onClose={() => setQuickOpenVisible(false)}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
}

/* ── VS Code–style Menu Bar ──────────────────────────────────────
   Renders: File | Edit | View | Go          [title]      [✕]    */

interface MenuItemDef {
    label: string;
    shortcut?: string;
    action?: () => void;
    checked?: boolean;
    disabled?: boolean;
    separator?: boolean;
}

interface MenuBarProps {
    sidebarOpen: boolean;
    minimapEnabled: boolean;
    wordWrapEnabled: boolean;
    fontSize: number;
    minFont: number;
    maxFont: number;
    defaultFont: number;
    hasFile: boolean;
    onToggleSidebar: () => void;
    onToggleMinimap: () => void;
    onToggleWordWrap: () => void;
    isMarkdown: boolean;
    markdownPreview: boolean;
    onToggleMarkdownPreview: () => void;
    onIncreaseFontSize: () => void;
    onDecreaseFontSize: () => void;
    onResetFontSize: () => void;
    onGoToFile: () => void;
    onDownloadOverlay: () => void;
    onDownloadFile: () => void;
    onCloseTab: () => void;
    onCloseAllTabs: () => void;
    onClose: () => void;
}

function MenuBar(props: MenuBarProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const barRef = useRef<HTMLDivElement>(null);

    /* Close on outside click */
    useEffect(() => {
        if (!activeMenu) return;
        const handler = (e: MouseEvent) => {
            if (barRef.current && !barRef.current.contains(e.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [activeMenu]);

    const toggle = (id: string) => setActiveMenu((cur) => (cur === id ? null : id));
    const run = (action?: () => void) => { setActiveMenu(null); action?.(); };

    const menus: { id: string; label: string; items: MenuItemDef[] }[] = [
        {
            id: "file", label: "File",
            items: [
                { label: "Download Overlay ZIP", action: props.onDownloadOverlay },
                { label: "Download Current File", action: props.onDownloadFile, disabled: !props.hasFile },
                { separator: true, label: "" },
                { label: "Close Tab",    shortcut: "Alt+W",       action: props.onCloseTab,    disabled: !props.hasFile },
                { label: "Close All",    shortcut: "Alt+Shift+W", action: props.onCloseAllTabs, disabled: !props.hasFile },
                { separator: true, label: "" },
                { label: "Close Preview", shortcut: "Esc", action: props.onClose },
            ],
        },
        {
            id: "edit", label: "Edit",
            items: [
                { label: "Copy",        shortcut: "⌘C / Ctrl+C", disabled: true },
                { label: "Select All",  shortcut: "⌘A / Ctrl+A", disabled: true },
                { separator: true, label: "" },
                { label: "Find",        shortcut: "⌘F / Ctrl+F", disabled: true },
                { label: "Replace",     shortcut: "⌘H / Ctrl+H", disabled: true },
            ],
        },
        {
            id: "view", label: "View",
            items: [
                { label: "Explorer",         checked: props.sidebarOpen,   action: props.onToggleSidebar },
                { separator: true, label: "" },
                { label: "Increase Font Size", shortcut: "A+", action: props.onIncreaseFontSize, disabled: props.fontSize >= props.maxFont },
                { label: "Decrease Font Size", shortcut: "A−", action: props.onDecreaseFontSize, disabled: props.fontSize <= props.minFont },
                { label: `Reset Font Size (${props.defaultFont}px)`, action: props.onResetFontSize, disabled: props.fontSize === props.defaultFont },
                { separator: true, label: "" },
                { label: "Minimap",     checked: props.minimapEnabled,  action: props.onToggleMinimap },
                { label: "Word Wrap",   checked: props.wordWrapEnabled, action: props.onToggleWordWrap },
                ...(props.isMarkdown ? [
                    { separator: true, label: "" } as MenuItemDef,
                    { label: "Markdown Preview", checked: props.markdownPreview, shortcut: "Ctrl+Shift+V", action: props.onToggleMarkdownPreview } as MenuItemDef,
                ] : []),
            ],
        },
        {
            id: "go", label: "Go",
            items: [
                { label: "Go to File…", shortcut: "⌘P / Ctrl+P", action: props.onGoToFile },
            ],
        },
    ];

    return (
        <div
            ref={barRef}
            style={{
                height: 30,
                background: VS.titleBar,
                display: "flex",
                alignItems: "stretch",
                flexShrink: 0,
                position: "relative",
                zIndex: 1000,
                userSelect: "none",
            }}
        >
            {/* Menu entries */}
            {menus.map((menu) => (
                <div key={menu.id} style={{ position: "relative" }}>
                    <MenuTrigger
                        label={menu.label}
                        active={activeMenu === menu.id}
                        onClick={() => toggle(menu.id)}
                        onMouseEnter={() => activeMenu && activeMenu !== menu.id && setActiveMenu(menu.id)}
                    />
                    {activeMenu === menu.id && (
                        <MenuDropdown items={menu.items} onRun={run} />
                    )}
                </div>
            ))}

            {/* Title centred */}
            <span style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 0, bottom: 0,
                display: "flex", alignItems: "center",
                color: "#cccccc", fontSize: 12,
                pointerEvents: "none",
            }}>
                CAS Initializr — Explorer
            </span>

            {/* Close button pushed to the right */}
            <button
                onClick={props.onClose}
                title="Close (Esc)"
                style={{
                    marginLeft: "auto",
                    background: "transparent",
                    border: "none",
                    color: "#cccccc",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#c42b1c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
                ✕
            </button>
        </div>
    );
}

function MenuTrigger({ label, active, onClick, onMouseEnter }: {
    label: string; active: boolean;
    onClick: () => void; onMouseEnter: () => void;
}) {
    return (
        <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            style={{
                background: active ? "#505050" : "transparent",
                border: "none",
                color: "#cccccc",
                cursor: "pointer",
                height: "100%",
                padding: "0 10px",
                fontSize: 13,
                fontFamily: EDITOR_FONT,
            }}
        >
            {label}
        </button>
    );
}

function MenuDropdown({ items, onRun }: { items: MenuItemDef[]; onRun: (a?: () => void) => void }) {
    return (
        <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            minWidth: 220,
            background: "#252526",
            border: "1px solid #474747",
            boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
            zIndex: 9999,
            paddingTop: 4,
            paddingBottom: 4,
            borderRadius: 4,
        }}>
            {items.map((item, i) => {
                if (item.separator) {
                    return <div key={i} style={{ height: 1, background: "#474747", margin: "4px 0" }} />;
                }
                return (
                    <MenuItemRow key={i} item={item} onRun={onRun} />
                );
            })}
        </div>
    );
}

function MenuItemRow({ item, onRun }: { item: MenuItemDef; onRun: (a?: () => void) => void }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={() => !item.disabled && onRun(item.action)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 20px 4px 28px",
                background: hov && !item.disabled ? "#094771" : "transparent",
                color: item.disabled ? "#555" : "#cccccc",
                cursor: item.disabled ? "default" : "pointer",
                fontSize: 13,
                fontFamily: EDITOR_FONT,
                gap: 8,
            }}
        >
            {/* Checkmark for toggled items */}
            <span style={{ position: "absolute", left: 8, color: "#007acc", fontSize: 12 }}>
                {item.checked !== undefined ? (item.checked ? "✓" : "") : ""}
            </span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
                <span style={{ color: "#858585", fontSize: 11, marginLeft: 16 }}>{item.shortcut}</span>
            )}
        </div>
    );
}

/* ── Flatten nested file tree → array of files only ───────────── */
function flattenTree(items: FileTreeItem[]): FileTreeItem[] {
    return items.reduce<FileTreeItem[]>((acc, item) => {
        if (item.type === "dir" && item.children) {
            return [...acc, ...flattenTree(item.children)];
        }
        return [...acc, item];
    }, []);
}

/* ── Quick Open (Cmd/Ctrl+P) ─────────────────────────────────────
   VS Code-style file picker overlay rendered inside the dialog.   */
function QuickOpen({
    fuse,
    allFiles,
    onSelect,
    onClose,
}: {
    fuse: Fuse<FileTreeItem>;
    allFiles: FileTreeItem[];
    onSelect: (item: FileTreeItem) => void;
    onClose: () => void;
}) {
    const [query, setQuery] = useState("");
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const results = useMemo<FileTreeItem[]>(() => {
        if (!query.trim()) return allFiles.slice(0, 50);
        return fuse.search(query).map((r) => r.item).slice(0, 50);
    }, [query, fuse, allFiles]);

    /* Auto-focus input */
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    /* Clamp activeIdx when results change */
    useEffect(() => {
        setActiveIdx(0);
    }, [results]);

    /* Scroll active item into view */
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLDivElement>(`[data-idx="${activeIdx}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, [activeIdx]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") { e.preventDefault(); onClose(); }
        else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); if (results[activeIdx]) onSelect(results[activeIdx]); }
    };

    return (
        /* Backdrop */
        <div
            onClick={onClose}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                paddingTop: 60,
            }}
        >
            {/* Panel */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(640px, 90vw)",
                    maxHeight: "60vh",
                    background: "#252526",
                    border: "1px solid #474747",
                    borderRadius: 6,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                }}
            >
                {/* Search input */}
                <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #474747" }}>
                    {/* Magnifier icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#858585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 8 }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Go to file…"
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "#cccccc",
                            fontSize: 14,
                            fontFamily: EDITOR_FONT,
                        }}
                    />
                    <span style={{ color: "#858585", fontSize: 11, marginLeft: 8, flexShrink: 0, fontFamily: EDITOR_FONT }}>Esc to close</span>
                </div>

                {/* Results list */}
                <div ref={listRef} style={{ overflowY: "auto", flex: 1 }}>
                    {results.length === 0 && (
                        <div style={{ padding: "12px 16px", color: "#858585", fontSize: 13 }}>No files found</div>
                    )}
                    {results.map((item, idx) => (
                        <QuickOpenRow
                            key={item.path}
                            idx={idx}
                            item={item}
                            active={idx === activeIdx}
                            query={query}
                            onSelect={onSelect}
                            onHover={() => setActiveIdx(idx)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function QuickOpenRow({
    idx,
    item,
    active,
    query,
    onSelect,
    onHover,
}: {
    idx: number;
    item: FileTreeItem;
    active: boolean;
    query: string;
    onSelect: (item: FileTreeItem) => void;
    onHover: () => void;
}) {
    /* Highlight matching chars in the filename */
    const highlighted = useMemo(() => highlightMatch(item.name, query), [item.name, query]);

    return (
        <div
            data-idx={idx}
            onClick={() => onSelect(item)}
            onMouseEnter={onHover}
            style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 12px",
                cursor: "pointer",
                background: active ? "#094771" : "transparent",
                gap: 8,
            }}
        >
            <span style={{ color: "#75beff", display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
                <FileTypeIcon type={item.type} fontSize="small" />
            </span>
            <span style={{ color: "#cccccc", fontSize: 13, fontFamily: EDITOR_FONT }}>
                {highlighted}
            </span>
            <span style={{ color: "#858585", fontSize: 11, marginLeft: "auto", paddingLeft: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260, fontFamily: "monospace", flexShrink: 1 }}>
                {item.path}
            </span>
        </div>
    );
}

/** Wrap matched characters in a <mark> for highlighting */
function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;
    const lower = text.toLowerCase();
    const q = query.toLowerCase();
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    // simple character-by-character highlight for fuzzy feel
    const matchSet = new Set<number>();
    let qi = 0;
    for (let i = 0; i < text.length && qi < q.length; i++) {
        if (lower[i] === q[qi]) { matchSet.add(i); qi++; }
    }
    for (let i = 0; i < text.length; i++) {
        if (matchSet.has(i)) {
            if (i > cursor) parts.push(text.slice(cursor, i));
            parts.push(<mark key={i} style={{ background: "transparent", color: "#e9b567", fontWeight: "bold" }}>{text[i]}</mark>);
            cursor = i + 1;
        }
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
}
function ActivityBarIcon({
    title,
    active,
    onClick,
    children,
}: {
    title: string;
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    const [hov, setHov] = useState(false);
    return (
        <button
            title={title}
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: "transparent",
                border: "none",
                borderLeft: active ? "2px solid #ffffff" : "2px solid transparent",
                color: active || hov ? "#ffffff" : "#858585",
                cursor: "pointer",
                width: 48,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "color 0.1s",
            }}
        >
            {children}
        </button>
    );
}

/* ── Editor tab ─────────────────────────────────────────────────── */
function Tab({
    tab,
    isActive,
    fontSize,
    onSelect,
    onClose,
    onContextMenu,
}: {
    tab: FileTreeItem;
    isActive: boolean;
    fontSize: number;
    onSelect: () => void;
    onClose: () => void;
    onContextMenu: (x: number, y: number) => void;
}) {
    const [hov, setHov] = useState(false);
    const [closeHov, setCloseHov] = useState(false);

    return (
        <div
            data-tabpath={tab.path}
            onClick={onSelect}
            onContextMenu={(e) => { e.preventDefault(); onContextMenu(e.clientX, e.clientY); }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => { setHov(false); setCloseHov(false); }}
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 10px 0 12px",
                height: "100%",
                background: isActive ? VS.tabActive : hov ? VS.tabHover : VS.tabInactive,
                color: isActive ? VS.tabActiveFg : VS.tabInactiveFg,
                borderRight: `1px solid ${VS.border}`,
                borderTop: `2px solid ${isActive ? VS.tabActiveBorder : "transparent"}`,
                cursor: "pointer",
                fontSize: fontSize,
                userSelect: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
                gap: 6,
                boxSizing: "border-box",
            }}
        >
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    color: "#75beff",
                    fontSize: 14,
                }}
            >
                <FileTypeIcon type={tab.type} fontSize="inherit" />
            </span>
            <span>{tab.name}</span>
            <span
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                onMouseEnter={() => setCloseHov(true)}
                onMouseLeave={() => setCloseHov(false)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: closeHov ? "rgba(255,255,255,0.2)" : "transparent",
                    color: hov || isActive ? "#cccccc" : "transparent",
                    fontSize: 14,
                    lineHeight: 1,
                    cursor: "pointer",
                    marginLeft: 2,
                    flexShrink: 0,
                }}
            >
                ×
            </span>
        </div>
    );
}

/* ── Tab context menu ────────────────────────────────────────────── */
function TabContextMenu({
    x,
    y,
    isLastTab,
    isRightmostTab,
    onClose,
    onCloseAll,
    onCloseToRight,
    onDismiss,
}: {
    x: number;
    y: number;
    isLastTab: boolean;
    isRightmostTab: boolean;
    onClose: () => void;
    onCloseAll: () => void;
    onCloseToRight: () => void;
    onDismiss: () => void;
}) {
    const menuRef = useRef<HTMLDivElement>(null);

    /* Close on outside click or Escape */
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onDismiss();
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onDismiss();
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [onDismiss]);

    const items: { label: string; shortcut?: string; action: () => void; disabled?: boolean }[] = [
        { label: "Close",              shortcut: "Alt+W",        action: onClose },
        { label: "Close All",          shortcut: "Alt+Shift+W",  action: onCloseAll,     disabled: isLastTab },
        { label: "Close to the Right",                           action: onCloseToRight, disabled: isRightmostTab },
    ];

    return (
        <div
            ref={menuRef}
            style={{
                position: "fixed",
                top: y,
                left: x,
                zIndex: 99999,
                background: "#252526",
                border: "1px solid #474747",
                borderRadius: 4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                paddingTop: 4,
                paddingBottom: 4,
                minWidth: 200,
            }}
        >
            {items.map((item, i) => (
                <TabContextMenuItem key={i} item={item} />
            ))}
        </div>
    );
}

function TabContextMenuItem({
    item,
}: {
    item: { label: string; shortcut?: string; action: () => void; disabled?: boolean };
}) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={() => !item.disabled && item.action()}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex",
                alignItems: "center",
                padding: "5px 16px 5px 16px",
                background: hov && !item.disabled ? "#094771" : "transparent",
                color: item.disabled ? "#555" : "#cccccc",
                cursor: item.disabled ? "default" : "pointer",
                fontSize: 13,
                fontFamily: EDITOR_FONT,
                userSelect: "none",
                gap: 8,
            }}
        >
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
                <span style={{ color: item.disabled ? "#444" : "#858585", fontSize: 11, marginLeft: 24, flexShrink: 0 }}>
                    {item.shortcut}
                </span>
            )}
        </div>
    );
}
