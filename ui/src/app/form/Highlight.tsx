import React from "react";
import Fuse from 'fuse.js';

export function highlight (value: string, indices = [], i: number = 1): any {
    const pair = indices[indices.length - i];

    return !pair ? (
        value
    ) : (
        <>
            {highlight(value.substring(0, pair[0]), indices, i + 1)}
            <mark>{value.substring(pair[0], pair[1] + 1)}</mark>
            {value.substring(pair[1] + 1)}
        </>
    );
};

export default function FuseHighlight ({ hit, attribute }: { hit: any, attribute: string }) {
    const matches =
        typeof hit.item === "string"
            ? hit.matches?.[0]
            : hit.matches?.find((m: any) => m.key === attribute);
    const fallback =
        typeof hit.item === "string"
            ? hit.item
            : Fuse.config.getFn(hit.item, attribute);
    return highlight(matches?.value || fallback, matches?.indices);
};

