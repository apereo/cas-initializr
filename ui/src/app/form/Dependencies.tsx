import React, { useState, useEffect } from "react";
import useFetch from 'use-http';

export default function Dependencies() {
    const [data, setData] = useState({});
    const { get, post, response, loading, error } = useFetch('/data')

    useEffect(() => { initializeData() }, []); // componentDidMount
    
    async function initializeData() {
        const d = await get("/spring.initializr.json");
        if (response.ok) {
            setData(d.dependencies);
        }
    }

    return (
        <pre>{JSON.stringify(data, null, 2)}</pre>
    );
}
