import { describe, expect, it } from 'vitest';
import { getCommandInvocationKey } from './invocation';

describe('getCommandInvocationKey', () => {
    it('uses the command id when payload is undefined', () => {
        expect(getCommandInvocationKey({ commandId: 'zoom.in' })).toBe('zoom.in');
    });

    it('includes non-default command scopes in invocation keys', () => {
        expect(getCommandInvocationKey({ scope: 'reader', commandId: 'zoom.in' })).toBe(
            'reader/zoom.in'
        );
        expect(getCommandInvocationKey({ commandId: 'zoom.in' })).not.toBe(
            getCommandInvocationKey({ scope: 'reader', commandId: 'zoom.in' })
        );
    });

    it('creates stable keys for primitive payloads', () => {
        expect(getCommandInvocationKey({ commandId: 'theme.effects.set', payload: 'mica' })).toBe(
            'theme.effects.set:"mica"'
        );
    });

    it('uses args in preference to payload and keeps one-arg keys compatible with payload keys', () => {
        expect(getCommandInvocationKey({ commandId: 'theme.effects.set', args: ['mica'] })).toBe(
            getCommandInvocationKey({ commandId: 'theme.effects.set', payload: 'mica' })
        );
        expect(
            getCommandInvocationKey({
                commandId: 'navigate.settings',
                payload: 'ignored',
                args: [{ tab: 'theme' }, true]
            })
        ).toBe('navigate.settings:[{"tab":"theme"},true]');
    });

    it('sorts plain object payload keys', () => {
        expect(
            getCommandInvocationKey({
                commandId: 'navigate.settings',
                payload: { tab: 'theme', nested: { b: true, a: 1 } }
            })
        ).toBe(
            getCommandInvocationKey({
                commandId: 'navigate.settings',
                payload: { nested: { a: 1, b: true }, tab: 'theme' }
            })
        );
    });
});
