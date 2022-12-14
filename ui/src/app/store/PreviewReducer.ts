import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { RootState } from "./RootReducer";
import { FileTreeItem } from '../file/tree';

export interface PreviewState {
    active: boolean;
    tree: FileTreeItem[];
    selected: FileTreeItem | null;
}

const stateSelector = (state: RootState) => state.preview;

export const AppSlice = createSlice({
    name: "App",
    initialState: {
        active: false,
        tree: [] as FileTreeItem[],
        selected: null as FileTreeItem | null,
    },
    reducers: {
        setPreviewState(state, action: PayloadAction<boolean>) {
            const preview = action.payload;
            state.active = action.payload;
            if (!preview) {
                state.tree = [];
            }
        },
        setPreviewTree(state, action: PayloadAction<FileTreeItem[]>) {
            state.tree = action.payload;
        },
        setPreviewSelected(state, action: PayloadAction<FileTreeItem>) {
            state.selected = action.payload;
        },
    },
});

export const PreviewStatusSelector = createSelector(
    stateSelector,
    (state: PreviewState) => state.active
);

export const PreviewTreeSelector = createSelector(
    stateSelector,
    (state: PreviewState) => state.tree
);

export const PreviewSelectedSelector = createSelector(
    stateSelector,
    (state: PreviewState) => state.selected
);

export function useIsPreviewing() {
    return useSelector(PreviewStatusSelector);
}

export function usePreviewTree() {
    return useSelector(PreviewTreeSelector);
}

export function usePreviewSelected() {
    return useSelector(PreviewSelectedSelector);
}


export const { setPreviewState, setPreviewTree, setPreviewSelected } =
    AppSlice.actions;

export default AppSlice;
