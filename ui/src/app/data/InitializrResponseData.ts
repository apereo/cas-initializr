import { Dependency } from "./Dependency";

export interface InitializrResponseData {
    _links: {
        [key: string]: {
            href: string;
            templated: boolean;
        }
    };

    dependencies: {
        type: string;
        values: DependencyType[]
    }
}

export interface DependencyType {
    name: string;
    values: Partial<Dependency>[];
}