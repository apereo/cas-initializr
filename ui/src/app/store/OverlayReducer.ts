import React from 'react';
import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { RootState } from "./RootReducer";
import { Overlay } from "../data/Overlay";
import { useDependencyList } from "./OptionReducer";
import { Dependency } from "../data/Dependency";
import { isEmpty, isNil, orderBy } from "lodash";

export const preselected = [
    'webapp-tomcat'
];

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
    deploymentType: string;
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
        dependencies: [
            ...preselected
        ] as string[],
        dockerSupported: 'true',
        helmSupported: 'false',
        herokuSupported: 'false',
        deploymentType: 'web'
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
                packaging,
                dockerSupported,
                helmSupported,
                herokuSupported,
                deploymentType,
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
            state.dockerSupported = dockerSupported;
            state.helmSupported = helmSupported;
            state.herokuSupported = herokuSupported;
            state.deploymentType = deploymentType;
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

    return React.useMemo(
        () =>
            orderBy(
                selected.map((s: string) =>
                    list.find((d: Dependency) => d.id === s)
                ),
                ["name"],
                "asc"
            ),
        [selected, list]
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
