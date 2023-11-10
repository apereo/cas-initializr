import { useMemo, useState, useCallback } from 'react';

import Fuse from "fuse.js";
import debounce from 'lodash/debounce';

export function useFuse<T>(list: T[], matchAllOnEmptyQuery: boolean, options: {}) {
    const [query, setQuery] = useState("");
    const fuse = useMemo(
        () => new Fuse<T>(list, options),
        [list, options]
    );

    const hits = useMemo(
        () => {
            if (!query && matchAllOnEmptyQuery) {
                // have to do this casting to access `docs`, for whatever reason Fuse doesnt have this property in the type definition
                const idx = fuse.getIndex() as any;
                return idx.docs.map((item: any, refIndex: any) => ({
                    item,
                    refIndex,
                }));
            }
            return fuse.search(query);
        }
            ,
        [fuse, matchAllOnEmptyQuery, query]
    );

    const update = useMemo(() => debounce(setQuery, 200), []);

    const search = useCallback((e: string) => update(e), [update]);
    return {
        hits,
        search,
        query,
    };
};
