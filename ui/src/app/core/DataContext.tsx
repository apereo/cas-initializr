import React, { PropsWithChildren } from 'react';

import { useEffect } from "react";
import useFetch from "use-http";
import { InitializrResponseData } from '../data/InitializrResponseData';
import { CasVersionOption } from '../data/Option';
import { setApiLoaded, setVersionsLoaded } from '../store/AppReducer';
import { useAppDispatch } from '../store/hooks';
import { setApiOptions, setCasVersionOptions } from "../store/OptionReducer";

import { API_PATH } from '../App.constant';

export const DataContext: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const dispatch = useAppDispatch();

    const api = useFetch<InitializrResponseData>(`${API_PATH}`);
    const actuator = useFetch<CasVersionOption[]>(`${API_PATH}actuator/supportedVersions`);

    /*eslint-disable react-hooks/exhaustive-deps*/
    useEffect(() => {
        initializeApiData();
        initializeVersions();
    }, []);

    async function initializeApiData() {
        const d = await api.get("");
        if (api.response.ok) {
            dispatch(setApiOptions(d));
            dispatch(setApiLoaded(true));
        }
    }

    async function initializeVersions() {
        const d = await actuator.get("");
        if (actuator.response.ok) {
            dispatch(setCasVersionOptions(d));
            dispatch(setVersionsLoaded(true))
        }
    }

    return <>{children}</>;
};

export default DataContext;