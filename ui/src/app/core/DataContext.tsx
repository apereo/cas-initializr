import React, { PropsWithChildren } from 'react';

import { useEffect } from "react";

import { setApiLoaded, setVersionsLoaded } from '../store/AppReducer';
import { useAppDispatch } from '../store/hooks';
import { setApiOptions, setCasVersionOptions, setAliasMap } from "../store/OptionReducer";

import { API_PATH } from '../App.constant';

const fetchProps = {
    headers: {
        "Content-Type": "application/json",
    },
};

export const DataContext: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const dispatch = useAppDispatch();

    /*eslint-disable react-hooks/exhaustive-deps*/
    useEffect(() => {
        initializeApiData();
        initializeVersions();
        initializeAliases();
    }, []);

    async function initializeApiData() {
        const response = await fetch(`${API_PATH}`, fetchProps);
        if (response.ok) {
            dispatch(setApiOptions(await response.json()));
            dispatch(setApiLoaded(true));
        }
    }

    async function initializeVersions() {
        const response = await fetch(`${API_PATH}actuator/supportedVersions`, fetchProps);
        if (response.ok) {
            dispatch(setCasVersionOptions(await response.json()));
            dispatch(setVersionsLoaded(true))
        }
    }

    async function initializeAliases() {
        try {
            const response = await fetch(`${API_PATH}actuator/info`, fetchProps);
            if (response.ok) {
                const info = await response.json();
                const depAliases: Record<string, string[]> = {};
                const raw = info?.["dependency-aliases"] ?? {};
                Object.entries(raw).forEach(([id, dep]: [string, any]) => {
                    if (Array.isArray(dep?.aliases) && dep.aliases.length > 0) {
                        depAliases[id] = dep.aliases;
                    }
                });
                dispatch(setAliasMap(depAliases));
            }
        } catch (_) {
            // non-fatal — aliases are optional
        }
    }

    return <>{children}</>;
};

export default DataContext;
