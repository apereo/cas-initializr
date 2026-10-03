/// <reference types="jest" />
import { getOverlayFromQs, getOverlayQuery } from './Url';
import { Overlay } from './Overlay';

afterEach(() => window.history.replaceState({}, '', '/'));

test.each([
    'webapp-tomcat,core-notifications',
    'webapp-tomcat%2Ccore-notifications',
    '%20webapp-tomcat%20,core-notifications,,webapp-tomcat',
])('reads dependency selections from the URL: %s', dependencies => {
    window.history.replaceState({}, '', `/?dependencies=${dependencies}`);
    expect(getOverlayFromQs().dependencies).toEqual(['webapp-tomcat', 'core-notifications']);
});

test('normalizes a single dependency into a list', () => {
    window.history.replaceState({}, '', '/?dependencies=core-notifications');
    expect(getOverlayFromQs().dependencies).toEqual(['core-notifications']);
});

test.each(['?dependencies', '?dependencies=', '?dependencies=,,'])('allows an explicitly empty selection: %s', query => {
    window.history.replaceState({}, '', `/${query}`);
    expect(getOverlayFromQs().dependencies).toEqual([]);
});

test('leaves an absent selection undefined so the default can be used', () => {
    expect(getOverlayFromQs().dependencies).toBeUndefined();
});

test('restores dependencies from a shared overlay URL', () => {
    const overlay = { dependencies: ['webapp-tomcat', 'core-notifications'], casVersion: 'test-version' } as Overlay;
    window.history.replaceState({}, '', `/?${getOverlayQuery(overlay)}`);
    expect(getOverlayFromQs()).toEqual(overlay);
});
