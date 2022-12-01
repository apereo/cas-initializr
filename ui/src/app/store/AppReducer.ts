import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { RootState } from "./RootReducer";

export interface AppState {
    apiLoaded: boolean;
    versionsLoaded: boolean;
}

const stateSelector = (state: RootState) => state.app;

export const AppSlice = createSlice({
    name: "App",
    initialState: {
        apiLoaded: false,
        versionsLoaded: false,
    },
    reducers: {
        setApiLoaded(state, action: PayloadAction<boolean>) {
            state.apiLoaded = action.payload;
        },
        setVersionsLoaded(state, action: PayloadAction<boolean>) {
            state.versionsLoaded = action.payload;
        },
    },
});

export const ApiLoadedSelector = createSelector(
    stateSelector,
    (state: AppState) => state.apiLoaded
);

export const VersionsLoadedSelector = createSelector(
    stateSelector,
    (state: AppState) => state.versionsLoaded
);

export function useApiLoaded() {
    return useSelector(ApiLoadedSelector);
}

export function useVersionsLoaded() {
    return useSelector(VersionsLoadedSelector);
}

export const { setApiLoaded, setVersionsLoaded } = AppSlice.actions;

export default AppSlice;
