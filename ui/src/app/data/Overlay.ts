export interface Overlay {
    casVersion: string;
    type: string;
    packaging: string;
    dependencies: string[];
    javaVersion: string;
    language: string;
    bootVersion: string;
    groupId: string;
    artifactId: string;
    version: string;
    name: string;
    description: string;
    packageName: string;
    dockerSupported: string;
    helmSupported: string;
    herokuSupported: string;
    deploymentType: string;
}
