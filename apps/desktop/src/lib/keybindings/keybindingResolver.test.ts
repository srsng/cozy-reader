import { describe, expect, it } from 'vitest';
import { ContextKey, ContextKeyService } from '$lib/context-keys';
import { ModifierKey, type StaticKeybinding } from './types';
import { KeybindingResolver } from './keybindingResolver';

const baseKeybinding: StaticKeybinding = {
    id: 'default-zoom-in',
    name: '放大',
    description: '放大',
    combination: { key: '=', modifiers: [ModifierKey.Ctrl] },
    commandId: 'zoom.in',
    source: 'default'
};

describe('KeybindingResolver', () => {
    it('prioritizes user keybindings over feature and default keybindings', () => {
        const resolver = new KeybindingResolver(new ContextKeyService());
        const combination = { key: '=', modifiers: [ModifierKey.Ctrl] };
        const keybindings: StaticKeybinding[] = [
            { ...baseKeybinding, id: 'legacy-zoom-in', source: 'legacy' },
            baseKeybinding,
            { ...baseKeybinding, id: 'feature-zoom-in', source: 'feature' },
            { ...baseKeybinding, id: 'user-zoom-in', source: 'user' }
        ];

        expect(resolver.resolve(keybindings, combination)?.id).toBe('user-zoom-in');
    });

    it('uses later registration order when matching keybindings from the same source', () => {
        const resolver = new KeybindingResolver(new ContextKeyService());
        const combination = { key: '=', modifiers: [ModifierKey.Ctrl] };
        const keybindings: StaticKeybinding[] = [
            { ...baseKeybinding, id: 'first-default', source: 'default' },
            { ...baseKeybinding, id: 'second-default', source: 'default' }
        ];

        expect(resolver.resolve(keybindings, combination)?.id).toBe('second-default');
    });

    it('skips keybindings when their context expression does not match', () => {
        const contextKeys = new ContextKeyService({
            [ContextKey.CommandPaletteOpen]: false
        });
        const resolver = new KeybindingResolver(contextKeys);
        const combination = { key: 'Esc', modifiers: [] };
        const keybindings: StaticKeybinding[] = [
            {
                ...baseKeybinding,
                id: 'close-commands',
                combination,
                commandId: 'app.closeCommands',
                when: ContextKey.CommandPaletteOpen
            }
        ];

        expect(resolver.resolve(keybindings, combination)).toBeNull();

        contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(resolver.resolve(keybindings, combination)?.id).toBe('close-commands');
    });

    it('matches keybindings with parenthesized when expressions', () => {
        const contextKeys = new ContextKeyService({
            [ContextKey.CommandPaletteOpen]: false,
            [ContextKey.Route]: '/settings',
            [ContextKey.TextInputFocus]: false
        });
        const resolver = new KeybindingResolver(contextKeys);
        const combination = { key: ',', modifiers: [ModifierKey.Ctrl] };
        const keybindings: StaticKeybinding[] = [
            {
                ...baseKeybinding,
                id: 'settings-on-settings-route',
                combination,
                commandId: 'navigate.settings',
                when: `(${ContextKey.Route} == "/settings" || ${ContextKey.CommandPaletteOpen}) && !${ContextKey.TextInputFocus}`
            }
        ];

        expect(resolver.resolve(keybindings, combination)?.id).toBe('settings-on-settings-route');

        contextKeys.set(ContextKey.TextInputFocus, true);

        expect(resolver.resolve(keybindings, combination)).toBeNull();
    });

    it('matches keybindings by complete command invocation payload', () => {
        const resolver = new KeybindingResolver(new ContextKeyService());
        const keybindings: StaticKeybinding[] = [
            {
                ...baseKeybinding,
                id: 'theme-blur',
                commandId: 'theme.effects.set',
                payload: 'blur'
            },
            {
                ...baseKeybinding,
                id: 'theme-mica',
                commandId: 'theme.effects.set',
                args: ['mica']
            }
        ];

        expect(
            resolver.getKeybindingsForInvocation(keybindings, {
                commandId: 'theme.effects.set',
                payload: 'mica'
            })
        ).toHaveLength(1);
        expect(
            resolver.getKeybindingsForInvocation(keybindings, {
                commandId: 'theme.effects.set',
                args: ['mica']
            })[0].id
        ).toBe('theme-mica');
    });

    it('inspects skipped keybindings and active conflicts', () => {
        const contextKeys = new ContextKeyService({
            [ContextKey.TextInputFocus]: false,
            [ContextKey.CommandPaletteOpen]: false
        });
        const resolver = new KeybindingResolver(contextKeys);
        const combination = { key: '=', modifiers: [ModifierKey.Ctrl] };
        const keybindings: StaticKeybinding[] = [
            baseKeybinding,
            {
                ...baseKeybinding,
                id: 'feature-zoom-in',
                source: 'feature'
            },
            {
                ...baseKeybinding,
                id: 'close-commands',
                commandId: 'app.closeCommands',
                when: ContextKey.CommandPaletteOpen
            }
        ];

        const resolution = resolver.inspect(keybindings, combination);

        expect(resolution.matched?.id).toBe('feature-zoom-in');
        expect(resolution.conflicts.map((keybinding) => keybinding.id)).toEqual([
            'default-zoom-in'
        ]);
        expect(resolution.skipped.map((candidate) => candidate.keybinding.id)).toEqual([
            'close-commands'
        ]);
    });

    it('skips keybindings without explicit when while a dialog is open', () => {
        const contextKeys = new ContextKeyService({
            [ContextKey.TextInputFocus]: false,
            [ContextKey.DialogOpen]: false,
            [ContextKey.CommandPaletteOpen]: false
        });
        const resolver = new KeybindingResolver(contextKeys);
        const combination = { key: '=', modifiers: [ModifierKey.Ctrl] };

        expect(resolver.resolve([baseKeybinding], combination)?.id).toBe('default-zoom-in');

        contextKeys.set(ContextKey.DialogOpen, true);

        expect(resolver.resolve([baseKeybinding], combination)).toBeNull();
    });

    it('skips keybindings without explicit when while the command palette is open', () => {
        const contextKeys = new ContextKeyService({
            [ContextKey.TextInputFocus]: false,
            [ContextKey.DialogOpen]: false,
            [ContextKey.CommandPaletteOpen]: false
        });
        const resolver = new KeybindingResolver(contextKeys);
        const combination = { key: '=', modifiers: [ModifierKey.Ctrl] };

        expect(resolver.resolve([baseKeybinding], combination)?.id).toBe('default-zoom-in');

        contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(resolver.resolve([baseKeybinding], combination)).toBeNull();
    });
});
