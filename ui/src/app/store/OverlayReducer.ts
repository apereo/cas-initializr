import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { RootState } from "./RootReducer";
import { Overlay } from "../data/Overlay";
import { useDependencyList } from "./OptionReducer";
import { Dependency } from "../data/Dependency";
import { isEmpty, isNil } from "lodash";

export interface OverlayState extends Overlay {
    casVersion: string;
    type: string;
    packaging: string;
    dependencies: string[];
    javaVersion: string;
    language: string;
    bootVersion: string;
    groupId: string;
    artifactId: string;
    version: string;
    name: string;
    description: string;
    packageName: string;
}

const stateSelector = (state: RootState) => state.overlay;

export const OverlaySlice = createSlice({
    name: "Overlay",
    initialState: {
        type: "",
        casVersion: "",
        groupId: "",
        artifactId: "",
        name: "",
        description: "",
        packageName: "",
        version: "",
        javaVersion: "",
        bootVersion: "",
        language: "",
        packaging: "",
        dependencies: [] as string[],
    },
    reducers: {
        setDependencies(state, action: PayloadAction<string[]>) {
            state.dependencies = action.payload;
        },
        setCustomization(state, action: PayloadAction<Overlay>) {
            const {
                type,
                casVersion,
                groupId,
                artifactId,
                version,
                name,
                description,
                packageName,
                javaVersion,
                bootVersion,
                language,
                packaging
            } = action.payload;
            state.type = type;
            state.casVersion = casVersion;
            state.groupId = groupId;
            state.artifactId = artifactId;
            state.version = version;
            state.name = name;
            state.description = description;
            state.packageName = packageName;
            state.javaVersion = javaVersion;
            state.bootVersion = bootVersion;
            state.language = language;
            state.packaging = packaging;
        },
    },
});

export const OverlayDependenciesSelector = createSelector(
    stateSelector,
    (state: OverlayState) => state.dependencies
);

export const OverlaySelector = createSelector(
    stateSelector,
    (state: OverlayState) => ({...state})
);

export function useOverlayDependencies() {
    return useSelector(OverlayDependenciesSelector);
}

export function useMappedOverlayDependencies() {
    const selected = useOverlayDependencies();
    const list = useDependencyList();

    return selected.map((s: string) =>
        list.find((d: Dependency) => d.id === s)
    );
}

export function useOverlay() {
    return useSelector(OverlaySelector);
}

export function useCanDownload() {
    const { type, casVersion } = useOverlay();
    return !isNil(type) && !isEmpty(type) && !isNil(casVersion) && !isEmpty(casVersion);
}

export const { setDependencies, setCustomization } = OverlaySlice.actions;

export default OverlaySlice;
