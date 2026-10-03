import { isNil, pickBy } from "lodash";
import { Overlay } from "./Overlay";
import qs from "query-string";

/*eslint-disable no-restricted-globals*/
export const getOverlayFromQs = (): Partial<Overlay> => {
    const overlay = qs.parse(location.search, { arrayFormat: "comma" });
    if (Object.prototype.hasOwnProperty.call(overlay, "dependencies")) {
        const values = [overlay.dependencies].flat();
        overlay.dependencies = Array.from(new Set(values.flatMap(value =>
            (value ?? "").split(",").map(id => id.trim()).filter(Boolean)
        )));
    }
    return overlay as Partial<Overlay>;
};

export const getOverlayQuery = (overlay: Overlay, type: string = "tgz") => {

    // console.log(overlay);

    const used = pickBy(overlay, (value: any) => value !== "" && !isNil(value));
    return qs.stringify(used, { arrayFormat: "comma" });
};
