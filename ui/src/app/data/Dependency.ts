export interface Dependency {
    type: string;
    id: string;
    name: string;
    description: string;
    aliases?: string[];
}

export const resolveDependencies = (selected: string[], available: Dependency[]): string[] => {
    return Array.from(new Set(selected.map(id => {
        const dependency = available.find(dep => dep.id === id)
            ?? available.find(dep => dep.aliases?.includes(id));
        return dependency?.id ?? id;
    })));
};
