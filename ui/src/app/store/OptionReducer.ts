import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { useMemo } from 'react';
import { orderBy, reverse, sortBy, uniq } from "lodash";
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

const mapVersions: { [id: string]: string } = {
    "cas-overlay": "cas",
    "cas-management-overlay": "cas-mgmt",
    "cas-config-server-overlay": "cas",
    "cas-discovery-server-overlay": "cas",
    "cas-bootadmin-server-overlay": "cas",
};

const stateSelector = (state: RootState): any => state.option;
const overlaySelector = (state: RootState): any => state.overlay;

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
            dockerSupported: {
                type: "",
                default: 'true'
            },
            helmSupported: {
                type: "",
                default: 'false'
            },
            herokuSupported: {
                type: "",
                default: 'false'
            },
            deploymentType: {
                type: "",
                default: 'web'
            }
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
                dockerSupported,
                helmSupported,
                herokuSupported,
                deploymentType,
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
            state.dockerSupported = dockerSupported || {default: 'true'};
            state.helmSupported = helmSupported || { default: 'false' };
            state.herokuSupported = herokuSupported || {default: 'false'};
            state.deploymentType = deploymentType || { default: 'web' };
        },
        setCasVersionOptions(state, action: PayloadAction<CasVersionOption[]>) {
            const { payload: versions } = action;
            state.casVersion = versions;
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

export const CurrentTypeSelector = createSelector(
    overlaySelector,
    (overlay: Overlay) => overlay.type
)

export const CasDefaultSelector = createSelector(
    stateSelector,
    CurrentTypeSelector,
    (state: OptionState, type: string): Partial<Overlay> => {
        const { casVersion: versions } = state;

        const id = mapVersions.hasOwnProperty(type) ? mapVersions[type] : null;

        let filtered = versions;

        if (id) {
            filtered = versions.filter((v) => v.type === id);
        }

        const stable = filtered.filter(({ version }) =>
            /^(\d+\.)?(\d+\.)?(\*|\d+)$/.test(version)
        );
        const sorted = reverse(sortBy(stable, ["version"]));

        return {
            type: state.type.default,
            packaging: state.packaging.default,
            javaVersion: state.javaVersion.default,
            language: state.language.default,
            groupId: state.groupId.default,
            artifactId: state.artifactId.default,
            version: state.version.default,
            name: state.name.default,
            description: state.description.default,
            packageName: state.packageName.default,
            casVersion: sorted?.length ? sorted[0].version : "",
            dockerSupported: state.dockerSupported.default,
            helmSupported: state.helmSupported.default,
            herokuSupported: state.herokuSupported.default,
            deploymentType: state.deploymentType.default,
        };
    }
);

export function useDependencyList(): Dependency[] {
    const deps = useSelector(OptionDependenciesSelector);

    const parsed = useMemo(() => {
        return deps?.reduce(
            (collection: DependencyOptionValue[], type: DependencyGroup) => {
                const p = orderBy(
                    type.values.map((dep: DependencyOptionValue) => ({
                        ...dep,
                        type: type.name,
                    })),
                    ["name"],
                    "asc"
                ) as DependencyOptionValue[];

                return [...collection, ...p];
            },
            [] as Dependency[]
        );
    }, [deps]);

    return parsed as Dependency[];
}

export function useDependencyListTypes(): string[] {
    const deps = useDependencyList();
    return uniq(deps.map((d) => d.type));
}

export function useCasVersions(): CasVersionOption[] {
    return useSelector(CasVersionsSelector);
}



export function useCasVersionsForType(type: string): CasVersionOption[] {
    const versions = useCasVersions();
    
    return useMemo(() => {
        const id = mapVersions.hasOwnProperty(type) ? mapVersions[type] : null;

        if (id) {
            return versions.filter((v) => v.type === id);
        }

        return [];
    }, [type, versions]);
}

export function useSortedCasVersionsForType(type: string): CasVersionOption[] {
    const versions = useCasVersionsForType(type);
    return reverse(sortBy(versions, ['version']));
}

export function useCasTypes(): TypeOptionValue[] {
    const types = useSelector(CasTypesSelector);
    return useMemo(() => {
        return types.map((t: any) => ({
            ...t,
            name: t.name.replace("Gradle Project Zip", ""),
        }));
    }, [types]);
}

export function useDefaultValues(): Partial<Overlay> {
    return useSelector(CasDefaultSelector);
}

export const { setApiOptions, setCasVersionOptions } = OptionSlice.actions;

export default OptionSlice;
