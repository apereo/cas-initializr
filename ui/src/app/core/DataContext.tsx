import React, { PropsWithChildren } from 'react';

import { useState, useEffect } from "react";
import useFetch from "use-http";
import { Dependency } from '../data/Dependency';
import { DependencyType, InitializrResponseData } from '../data/InitializrResponseData';
import { setList } from '../store/DependencyReducer';
import { useAppDispatch } from '../store/hooks';

export const DataContext: React.FC<PropsWithChildren<{}>> = ({ children }) => {

    const dispatch = useAppDispatch();

    const [data, setData] = useState({});
    const { get, response } = useFetch<InitializrResponseData>("/api");

    useEffect(() => {
        initializeData();
    }, []);

    async function initializeData() {
        const d = await get("/");
        if (response.ok) {
            const parsed = d.dependencies.values.reduce(
                (collection: Dependency[], type: DependencyType) => {
                    const p = type.values.map((dep) => ({
                        ...dep,
                        type: type.name
                    })) as Dependency[];

                    return [
                        ...collection,
                        ...p
                    ];
                },
                [] as Dependency[]
            );

            dispatch(setList(parsed));
        }
    }

    return (<>{children}</>);
};

export default DataContext;