import { useState } from "react";
import { FileTreeItem } from "../file/tree";
import { FileTypeIcon } from "./FileTypeIcon";

import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { Expand } from "./Expand";

export function FileListItem ({item, select, depth = 1}: {item: FileTreeItem, select: (item: FileTreeItem) => void, depth: number}) {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    };
    return (
        <>
            <ListItemButton
                onClick={item.type === "dir" ? handleClick : () => select(item)}
                sx={{ pl: 4 * depth }}
            >
                <ListItemIcon>{<FileTypeIcon type={item.type} />}</ListItemIcon>
                <ListItemText primary={item.name} />
                {item.type === "dir" && <Expand status={open} />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {item.children?.map((f: FileTreeItem, idx: number) => (
                        <FileListItem key={idx}
                            select={select}
                            item={f}
                            depth={depth + 1}
                        />
                    ))}
                    {item.children?.length === 0 && (
                        <ListItemButton sx={{ pl: 4 * depth }}>
                            <ListItemText inset>
                                <em>(empty)</em>
                            </ListItemText>
                        </ListItemButton>
                    )}
                </List>
            </Collapse>
        </>
    );
}