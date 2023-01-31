export interface OptionValue {
    id: string;
    name: string;
}

export interface TypeOptionValue extends OptionValue {
    description?: string;
    action?: string;
    tags?: string[];
}

export interface CasVersionOption {
    containerBaseImage: string;
    version: string;
    bootVersion: string;
    sync: boolean;
    validate: boolean;
    branch: string;
    type: string;
    platformVersion: string;
    tomcatVersion: string;
    javaVersion: string;
}

export interface DependencyOptionValue extends OptionValue {
    id: string;
    name: string;
    description?: string;
    type?: string;
}

export interface DependencyOption {
    type: string;
    values?: DependencyGroup[];
}

export interface DependencyGroup {
    name: string;
    values: DependencyOptionValue[];
}

export interface Option {
    type: string;
    default: string;
    values?: OptionValue[];
}

export interface TypeOption extends Option {
    values?: TypeOptionValue[];
}

export interface ApiOptions {
    type: TypeOption;
    packaging: Option;
    dependencies: DependencyOption;
    javaVersion: Option;
    language: Option;
    bootVersion: Option;
    groupId: Option;
    artifactId: Option;
    version: Option;
    name: Option;
    description: Option;
    packageName: Option;
    dockerSupported: Option;
    helmSupported: Option;
    herokuSupported: Option;
    deploymentType: Option;
}
