import React from 'react';
import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { RootState } from "./RootReducer";
import { Overlay } from "../data/Overlay";
import { useDependencyList, usePropertyList } from "./OptionReducer";
import { Dependency } from "../data/Dependency";
import { isEmpty, isNil, orderBy } from "lodash";
import { Property } from '../data/Property';

export const preselected = [
    'webapp-tomcat'
];

export interface OverlayState extends Overlay {
    casVersion: string;
    type: string;
    packaging: string;
    dependencies: string[];
    properties: string[];
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
        properties: [] as string[],
        dockerSupported: 'true',
        puppeteerSupported: 'true',
        githubActionsSupported: 'true',
        nativeImageSupported: 'false',
        openRewriteSupported: 'true',
        commandlineShellSupported: 'true',
        helmSupported: 'false',
        herokuSupported: 'false',
        sbomSupported: 'true',
        deploymentType: 'executable'
    },
    reducers: {
        setDependencies(state, action: PayloadAction<string[]>) {
            state.dependencies = action.payload;
        },
        setProperties(state, action: PayloadAction<string[]>) {
            state.properties = action.payload;
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
                sbomSupported,
                puppeteerSupported,
                githubActionsSupported,
                nativeImageSupported,
                openRewriteSupported,
                commandlineShellSupported,
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
            state.sbomSupported = sbomSupported;
            state.puppeteerSupported = puppeteerSupported;
            state.githubActionsSupported = githubActionsSupported;
            state.nativeImageSupported = nativeImageSupported;
            state.openRewriteSupported = openRewriteSupported;
            state.commandlineShellSupported = commandlineShellSupported;
            state.deploymentType = deploymentType;
        },
    },
});

export const OverlayDependenciesSelector = createSelector(
    stateSelector,
    (state: OverlayState) => state.dependencies
);

export const OverlayPropertiesSelector = createSelector(
    stateSelector,
    (state: OverlayState) => state.properties
);

export const OverlaySelector = createSelector(
    stateSelector,
    (state: OverlayState) => ({...state})
);

export function useOverlayDependencies() {
    return useSelector(OverlayDependenciesSelector);
}

export function useOverlayProperties() {
    return useSelector(OverlayPropertiesSelector);
}

export function useMappedOverlayDependencies() {
    const selected = useOverlayDependencies();
    const list = useDependencyList();

    return React.useMemo<Dependency[]>(
        () => {
            let l: any[] = selected.map((s: string) => list.find((d: Dependency) => d.id === s));
            l = l.filter((d: Dependency | undefined) => !!d);
            return orderBy<Dependency>(
                l,
                ["name"],
                "asc"
            );
        }, [selected, list]
    );
}

export function useMappedOverlayProperties() {
    const selected = useOverlayProperties();
    const list = usePropertyList();

    return React.useMemo<Property[]>(
        () => {
            let l: any[] = selected.map((s: string) => list.find((d: Property) => d.name === s));
            l = l.filter((d: Property | undefined) => !!d);
            return orderBy<Property>(
                l,
                ["name"],
                "asc"
            );
        }, [selected, list]
    );
}

export function useOverlay() {
    return useSelector(OverlaySelector);
}

export function useCanDownload() {
    const { type, casVersion } = useOverlay();
    return !isNil(type) && !isEmpty(type) && !isNil(casVersion) && !isEmpty(casVersion);
}

export function useSelectedCasVersion() {
    const { casVersion } = useOverlay();
    return casVersion;
}

export const { setDependencies, setCustomization, setProperties } = OverlaySlice.actions;

export default OverlaySlice;
