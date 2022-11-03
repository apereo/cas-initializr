import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { useMemo } from 'react';

import { RootState } from "./RootReducer";

import {
    CasVersionOption,
    ApiOptions,
    DependencyGroup,
    DependencyOptionValue,
    TypeOptionValue,
} from "../data/Option";
import { Dependency } from "../data/Dependency";
import { Overlay } from "../data/Overlay";

export interface OptionState extends ApiOptions {
    casVersion: CasVersionOption[];
}

const stateSelector = (state: RootState): any => state.option;

export const OptionSlice = createSlice({
    name: "Option",
    initialState: () =>
        ({
            casVersion: [],
            type: {
                type: "",
                default: "",
            },
            packaging: {
                type: "",
                default: "",
            },
            javaVersion: {
                type: "",
                default: "",
            },
            language: {
                type: "",
                default: "",
            },
            bootVersion: {
                type: "",
                default: "",
            },
            groupId: {
                type: "",
                default: "",
            },
            artifactId: {
                type: "",
                default: "",
            },
            version: {
                type: "",
                default: "",
            },
            name: {
                type: "",
                default: "",
            },
            description: {
                type: "",
                default: "",
            },
            packageName: {
                type: "",
                default: "",
            },
            dependencies: {
                type: "",
                values: [],
            },
        } as OptionState),
    reducers: {
        setApiOptions(state, action: PayloadAction<ApiOptions>) {
            const {
                type,
                packaging,
                dependencies,
                javaVersion,
                language,
                bootVersion,
                groupId,
                artifactId,
                version,
                name,
                description,
                packageName,
            } = action.payload;

            state.type = type;
            state.packaging = packaging;
            state.dependencies = dependencies;
            state.javaVersion = javaVersion;
            state.language = language;
            state.bootVersion = bootVersion;
            state.groupId = groupId;
            state.artifactId = artifactId;
            state.version = version;
            state.name = name;
            state.description = description;
            state.packageName = packageName;
        },
        setCasVersionOptions(state, action: PayloadAction<CasVersionOption[]>) {
            state.casVersion = action.payload;
        },
    },
});

export const OptionDependenciesSelector = createSelector(
    stateSelector,
    (state: OptionState): DependencyGroup[] => {
        return state.dependencies.values ? state.dependencies.values : [];
    }
);

export const CasVersionsSelector = createSelector(
    stateSelector,
    (state: OptionState): CasVersionOption[] => {
        return state.casVersion;
    }
);

export const CasTypesSelector = createSelector(
    stateSelector,
    (state: OptionState): TypeOptionValue[] => {
        return state.type.values || [];
    }
);

export const CasDefaultSelector = createSelector(
    stateSelector,
    (state: OptionState): Partial<Overlay> => {
        return {
            type: state.type.default,
            packaging: "", // state.packaging.default
            javaVersion: "", // state.javaVersion.default,
            language: "", // state.language.default,
            groupId: "", // state.groupId.default,
            artifactId: "", // state.artifactId.default,
            version: "", // state.version.default,
            name: "", // state.name.default,
            description: "", // state.description.default,
            packageName: "", // state.packageName.default,
        };
    }
);

export function useDependencies(): Dependency[] {
    const deps = useSelector(OptionDependenciesSelector);

    const parsed = useMemo(() => {
        return deps?.reduce(
            (collection: DependencyOptionValue[], type: DependencyGroup) => {
                const p = type.values.map((dep: DependencyOptionValue) => ({
                    ...dep,
                    type: type.name,
                })) as DependencyOptionValue[];

                return [...collection, ...p];
            },
            [] as Dependency[]
        );
    }, [deps]);

    return parsed as Dependency[];
}

export function useCasVersions(): CasVersionOption[] {
    return useSelector(CasVersionsSelector);
}

const map: { [id: string]: string } = {
    "cas-overlay": "cas",
    "cas-management-overlay": "cas-mgmt",
};

export function useCasVersionsForType(type: string): CasVersionOption[] {
    const versions = useCasVersions();
    
    return useMemo(() => {
        const id = map.hasOwnProperty(type) ? map[type] : null;

        if (id) {
            return versions.filter((v) => v.type === id);
        }

        return [];
    }, [type, versions]);
}

export function useCasTypes(): TypeOptionValue[] {
    return useSelector(CasTypesSelector);
}

export function useDefaultValues(): Partial<Overlay> {
    return useSelector(CasDefaultSelector);
}

export const { setApiOptions, setCasVersionOptions } = OptionSlice.actions;

export default OptionSlice;
