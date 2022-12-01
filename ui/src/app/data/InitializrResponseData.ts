import { ApiOptions } from "./Option";
export interface InitializrResponseData extends ApiOptions {
    _links: {
        [key: string]: {
            href: string;
            templated: boolean;
        };
    };
}
