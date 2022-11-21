import React, { PropsWithChildren } from 'react';

import { useEffect } from "react";

import { setApiLoaded, setVersionsLoaded } from '../store/AppReducer';
import { useAppDispatch } from '../store/hooks';
import { setApiOptions, setCasVersionOptions } from "../store/OptionReducer";

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

    return <>{children}</>;
};

export default DataContext;