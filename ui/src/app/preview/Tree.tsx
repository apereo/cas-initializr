import React from "react";
import { setPreviewSelected, usePreviewSelected, usePreviewTree } from "../store/PreviewReducer";
import { FileListItem } from "./FileListItem";
import { FileTreeItem } from "../file/tree";
import { useAppDispatch } from "../store/hooks";

export function Tree() {
    const tree = usePreviewTree();
    const dispatch = useAppDispatch();
    const selected = usePreviewSelected();

    const handleSelect = (item: FileTreeItem) => {
        dispatch(setPreviewSelected(item));
    };

    return (
        <div style={{ paddingTop: 4, paddingBottom: 8 }}>
            {tree?.map((item: FileTreeItem, idx: number) => (
                <FileListItem
                    key={idx}
                    depth={0}
                    select={handleSelect}
                    item={item}
                    selectedPath={selected?.path}
                />
            ))}
        </div>
    );
}
