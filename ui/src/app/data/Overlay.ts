import { Dependency } from "./Dependency";

export interface Overlay {
    version: string;
    group: string;
    artifact: string;
    name: string;
    description: string;
    package: string;
    dependencies: Dependency[];
}

