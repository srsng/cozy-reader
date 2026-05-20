import { describe, expect, it, vi } from 'vitest';
import { ContextKeyService } from './contextKeyService';

describe('ContextKeyService', () => {
    it('matches truthy and negated keys', () => {
        const contextKeys = new ContextKeyService({
            commandPaletteOpen: false,
            textInputFocus: true
        });

        expect(contextKeys.match('textInputFocus')).toBe(true);
        expect(contextKeys.match('!commandPaletteOpen')).toBe(true);
        expect(contextKeys.match('!textInputFocus')).toBe(false);
    });

    it('matches equality expressions and boolean operators', () => {
        const contextKeys = new ContextKeyService({
            route: '/settings',
            themeEffects: 'mica',
            resourceExtname: '.ts',
            readerBookOpen: false
        });

        expect(contextKeys.match("route == '/settings'")).toBe(true);
        expect(contextKeys.match('themeEffects == mica')).toBe(true);
        expect(contextKeys.match('resourceExtname != .js')).toBe(true);
        expect(contextKeys.match('themeEffects === mica')).toBe(true);
        expect(contextKeys.match('themeEffects !== blur')).toBe(true);
        expect(contextKeys.match("route != '/reader' && !readerBookOpen")).toBe(true);
        expect(contextKeys.match("route == '/reader' || route == '/settings'")).toBe(true);
    });

    it('matches numeric and string values used by menu toggled state', () => {
        const contextKeys = new ContextKeyService({
            themeEffects: 'mica',
            windowAlwaysOnTop: true
        });

        expect(contextKeys.match('themeEffects == "mica"')).toBe(true);
        expect(contextKeys.match('windowAlwaysOnTop == true')).toBe(true);
        expect(contextKeys.match('themeEffects == "blur"')).toBe(false);
    });

    it('respects parenthesized boolean precedence', () => {
        const contextKeys = new ContextKeyService({
            a: true,
            b: false,
            c: false
        });

        expect(contextKeys.match('a || b && c')).toBe(true);
        expect(contextKeys.match('(a || b) && c')).toBe(false);
        expect(contextKeys.match('(a || b) && !c')).toBe(true);
    });

    it('matches numeric comparison expressions', () => {
        const contextKeys = new ContextKeyService({
            zoom: 1.25,
            route: '/settings'
        });

        expect(contextKeys.match('zoom > 1')).toBe(true);
        expect(contextKeys.match('zoom >= 1.25')).toBe(true);
        expect(contextKeys.match('zoom < 2 && route == "/settings"')).toBe(true);
        expect(contextKeys.match('route > 1')).toBe(false);
    });

    it('matches in and not in expressions', () => {
        const contextKeys = new ContextKeyService({
            route: '/settings',
            themeEffects: 'mica',
            routes: ['/settings', '/reader'],
            routeMap: {
                '/settings': true,
                '/reader': true
            }
        });

        expect(contextKeys.match('route in ["/settings", "/reader"]')).toBe(true);
        expect(contextKeys.match('route in routes')).toBe(true);
        expect(contextKeys.match('route in routeMap')).toBe(true);
        expect(contextKeys.match('themeEffects not in ["blur", "acrylic"]')).toBe(true);
        expect(contextKeys.match('themeEffects in ["blur", "acrylic"]')).toBe(false);
        expect(contextKeys.match('themeEffects not in routeMap')).toBe(true);
    });

    it('matches regular expression expressions', () => {
        const contextKeys = new ContextKeyService({
            resourceFilename: 'Dockerfile',
            route: '/reader'
        });

        expect(contextKeys.match('resourceFilename =~ /docker/i')).toBe(true);
        expect(contextKeys.match('!(route =~ /settings/)')).toBe(true);
        expect(contextKeys.match('route =~ /settings/')).toBe(false);
    });

    it('keeps context lookup semantics on the right side of in expressions', () => {
        const contextKeys = new ContextKeyService({
            themeEffects: 'mica',
            allowedEffects: ['mica']
        });

        expect(contextKeys.match('themeEffects in allowedEffects')).toBe(true);
        expect(contextKeys.match('themeEffects in missingEffects')).toBe(false);
    });

    it('inspects expressions without throwing', () => {
        const contextKeys = new ContextKeyService({
            route: '/settings',
            textInputFocus: false
        });

        const inspection = contextKeys.inspect('route == "/settings" && !textInputFocus');

        expect(inspection.matches).toBe(true);
        expect(inspection.referencedKeys).toEqual(['route', 'textInputFocus']);
        expect(inspection.snapshot.route).toBe('/settings');
        expect(inspection.error).toBeUndefined();
    });

    it('returns inspection errors for invalid expressions', () => {
        const contextKeys = new ContextKeyService({ route: '/settings' });
        const inspection = contextKeys.inspect('route ==');

        expect(inspection.matches).toBe(false);
        expect(inspection.referencedKeys).toEqual([]);
        expect(inspection.error).toBeInstanceOf(Error);
    });

    it('returns false and warns for invalid expressions', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const contextKeys = new ContextKeyService({ route: '/settings' });

        expect(contextKeys.match('route ==')).toBe(false);
        expect(warn).toHaveBeenCalledOnce();

        warn.mockRestore();
    });

    it('reads projected context keys from snapshots', () => {
        const contextKeys = new ContextKeyService({ route: '/settings' });

        contextKeys.registerProjection({
            id: 'test',
            getSnapshot: () => ({
                commandPaletteOpen: true
            })
        });

        expect(contextKeys.get('commandPaletteOpen')).toBe(true);
        expect(contextKeys.match('commandPaletteOpen && route == "/settings"')).toBe(true);
        expect(contextKeys.inspect('commandPaletteOpen').snapshot.commandPaletteOpen).toBe(true);
    });

    it('emits changes when a projection source changes', () => {
        let open = false;
        let emitChange: (() => void) | undefined;
        const listener = vi.fn();
        const contextKeys = new ContextKeyService();

        contextKeys.registerProjection({
            id: 'test',
            getSnapshot: () => ({
                commandPaletteOpen: open
            }),
            subscribe: (emit) => {
                emitChange = emit;
                return () => undefined;
            }
        });
        contextKeys.onDidChange(listener);

        open = true;
        emitChange?.();

        expect(listener).toHaveBeenCalledWith({ commandPaletteOpen: true });
    });

    it('removes projected keys when a projection is disposed', () => {
        const contextKeys = new ContextKeyService();
        const disposable = contextKeys.registerProjection({
            id: 'test',
            getSnapshot: () => ({
                commandPaletteOpen: true
            })
        });

        expect(contextKeys.get('commandPaletteOpen')).toBe(true);

        disposable.dispose();

        expect(contextKeys.get('commandPaletteOpen')).toBeUndefined();
    });

    it('rejects duplicate projection ids and duplicate keys', () => {
        const contextKeys = new ContextKeyService({ route: '/settings' });

        contextKeys.registerProjection({
            id: 'first',
            getSnapshot: () => ({ commandPaletteOpen: true })
        });

        expect(() =>
            contextKeys.registerProjection({
                id: 'first',
                getSnapshot: () => ({ textInputFocus: true })
            })
        ).toThrow('Overwriting context key projection: first');

        expect(() =>
            contextKeys.registerProjection({
                id: 'second',
                getSnapshot: () => ({ commandPaletteOpen: false })
            })
        ).toThrow('Duplicate context key "commandPaletteOpen"');

        expect(() => contextKeys.set('commandPaletteOpen', false)).toThrow(
            'Cannot set projected context key "commandPaletteOpen" manually'
        );
        expect(contextKeys.get('commandPaletteOpen')).toBe(true);
        expect(() =>
            contextKeys.registerProjection({
                id: 'third',
                getSnapshot: () => ({ route: '/reader' })
            })
        ).toThrow('Duplicate context key "route"');
    });
});
