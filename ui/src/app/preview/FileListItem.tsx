import React, { useState } from "react";
import { FileTreeItem } from "../file/tree";
import { FileTypeIcon } from "./FileTypeIcon";

const EDITOR_FONT = "'Comic Mono', 'Ubuntu', Consolas, 'Courier New', monospace";
const ITEM_HEIGHT = 28;

export function FileListItem({
    item,
    select,
    depth = 0,
    selectedPath,
}: {
    item: FileTreeItem;
    select: (item: FileTreeItem) => void;
    depth: number;
    selectedPath?: string;
}) {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);

    const isDir = item.type === "dir";
    const isSelected = !isDir && selectedPath === item.path;

    const handleClick = () => {
        if (isDir) {
            setOpen((o) => !o);
        } else {
            select(item);
        }
    };

    const rowBg = isSelected
        ? "#094771"
        : hovered
        ? "#2a2d2e"
        : "transparent";

    return (
        <>
            <div
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: ITEM_HEIGHT,
                    paddingLeft: depth * 12 + 8,
                    cursor: "pointer",
                    backgroundColor: rowBg,
                    color: "#cccccc",
                    fontSize: 18,
                    fontFamily: EDITOR_FONT,
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {/* Folder expand arrow */}
                <span
                    style={{
                        width: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "#c5c5c5",
                        fontSize: 12,
                    }}
                >
                    {isDir ? (open ? "▾" : "▸") : ""}
                </span>
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        marginRight: 6,
                        flexShrink: 0,
                    }}
                >
                    <FileTypeIcon type={item.type} name={item.name} open={open} />
                </span>
                {/* Name */}
                <span
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flexShrink: 1,
                    }}
                >
                    {item.name}
                </span>
            </div>

            {/* Children */}
            {isDir && open && (
                <div>
                    {item.children && item.children.length > 0 ? (
                        item.children.map((child, idx) => (
                            <FileListItem
                                key={idx}
                                item={child}
                                select={select}
                                depth={depth + 1}
                                selectedPath={selectedPath}
                            />
                        ))
                    ) : (
                        <div
                            style={{
                                paddingLeft: (depth + 1) * 12 + 24,
                                height: ITEM_HEIGHT,
                                lineHeight: `${ITEM_HEIGHT}px`,
                        color: "#858585",
                        fontSize: 16,
                        fontStyle: "italic",
                        fontFamily: EDITOR_FONT,
                            }}
                        >
                            (empty)
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
