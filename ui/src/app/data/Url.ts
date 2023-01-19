import { isNil, pickBy } from "lodash";
import { Overlay } from "./Overlay";
import qs from "query-string";

/*eslint-disable no-restricted-globals*/
export const getOverlayFromQs = (): Overlay => {
    const overlay: unknown = qs.parse(location.search, { arrayFormat: "comma" }) as Partial<Overlay>;
    return overlay as Overlay;
};

export const getOverlayQuery = (overlay: Overlay, type: string = "tgz") => {
    const used = pickBy(overlay, (value: any) => value !== "" && !isNil(value));
    return qs.stringify(used, { arrayFormat: "comma" });
};
