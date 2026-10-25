import { isNil, pickBy } from "lodash";
import { Overlay } from "./Overlay";

// Matches query-string's strict encoding, which also escapes !'()*
const encode = (value: unknown) => encodeURIComponent(String(value))
    .replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

/*eslint-disable no-restricted-globals*/
export const getOverlayFromQs = (): Partial<Overlay> => {
    const params = new URLSearchParams(location.search);
    const overlay: Record<string, unknown> = Object.fromEntries(params);
    if (params.has("dependencies")) {
        overlay.dependencies = Array.from(new Set(params.getAll("dependencies").flatMap(value =>
            value.split(",").map(id => id.trim()).filter(Boolean)
        )));
    }
    return overlay as Partial<Overlay>;
};

export const getOverlayQuery = (overlay: Overlay, type: string = "tgz") => {
    const used = pickBy(overlay, (value: any) => value !== "" && !isNil(value));
    return Object.keys(used)
        .sort()
        .map(key => {
            const value = (used as Record<string, unknown>)[key];
            const encoded = Array.isArray(value)
                ? value.map(encode).join(",")
                : encode(value);
            return `${encode(key)}=${encoded}`;
        })
        .join("&");
};
