import {
    createSlice,
    createAsyncThunk,
    createSelector,
    PayloadAction,
} from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { RootState } from "./RootReducer";
import { Dependency } from "../data/Dependency";
import orderBy from "lodash/orderBy";

export interface DependencyState {
    list: Dependency[];
    loading: boolean;
}


const stateSelector = (state: RootState) => state.dependencies;

export const DependencySlice = createSlice({
    name: "Dependency",
    initialState: {
        list: [] as Dependency[],
        loading: false,
    },
    reducers: {
        setList(state, action: PayloadAction<Dependency[]>) {
            state.list = action.payload;
        }
    },
});


export const DependenciesSelector = createSelector(
    stateSelector,
    (state: DependencyState) => state.list
);
export const DependenciesLoadingSelector = createSelector(
    stateSelector,
    (state: DependencyState) => state.loading
);

export const { setList } = DependencySlice.actions;

export function useDependencies() {
    return orderBy(useSelector(DependenciesSelector), ["name"], ["asc"]);
}

export function useDependenciesLoading() {
    return useSelector(DependenciesLoadingSelector);
}

export default DependencySlice;
