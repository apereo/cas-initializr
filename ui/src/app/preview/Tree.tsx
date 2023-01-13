import React from "react";

import {
    Box,
    List
} from "@mui/material";

import { setPreviewSelected, usePreviewTree } from "../store/PreviewReducer";
import { FileListItem } from "./FileListItem";
import { FileTreeItem } from "../file/tree";
import { useAppDispatch } from "../store/hooks";


export function Tree() {
    const tree = usePreviewTree();
    const dispatch = useAppDispatch();

    const handleSelect = (item: FileTreeItem) => {
        dispatch(setPreviewSelected(item));
    }
    return (
        <Box
            sx={{
                height: 'calc(100vh - 64px)',
                overflow: "scroll",
            }}
        >
            <List>
                {tree?.map((item: FileTreeItem, idx: number) => (
                    <FileListItem
                        key={idx}
                        depth={1}
                        select={handleSelect}
                        item={item}
                    />
                ))}
            </List>
        </Box>
    );
}
