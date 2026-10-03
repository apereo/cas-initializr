/// <reference types="jest" />
import { Dependency, resolveDependencies } from './Dependency';

const available: Dependency[] = [
    { id: 'webapp-tomcat', name: 'Tomcat', type: 'webapp', description: '', aliases: ['tomcat'] },
    { id: 'core-notifications', name: 'Notifications', type: 'core', description: '', aliases: ['notifications'] },
];

test('keeps URL selections until metadata arrives, then resolves aliases to IDs', () => {
    const selected = resolveDependencies(['tomcat', 'core-notifications'], []);
    expect(selected).toEqual(['tomcat', 'core-notifications']);
    expect(resolveDependencies(selected, available)).toEqual(['webapp-tomcat', 'core-notifications']);
});

test('deduplicates aliases and IDs referring to the same dependency', () => {
    expect(resolveDependencies(['tomcat', 'webapp-tomcat', 'notifications'], available))
        .toEqual(['webapp-tomcat', 'core-notifications']);
});

test('prefers an exact ID over an alias on another dependency', () => {
    const conflicting = [{ ...available[0], aliases: ['core-notifications'] }, available[1]];
    expect(resolveDependencies(['core-notifications'], conflicting)).toEqual(['core-notifications']);
});

test('preserves unknown IDs for backend validation', () => {
    expect(resolveDependencies(['unknown'], available)).toEqual(['unknown']);
});

test('does not restore selections after the user clears them', () => {
    expect(resolveDependencies([], available)).toEqual([]);
});
