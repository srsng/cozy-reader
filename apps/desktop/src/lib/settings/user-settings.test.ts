import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, mergeUserSettingsWithDefaults } from './user-settings';

vi.mock('mode-watcher', () => ({
    mode: { current: 'system' }
}));

describe('user settings defaults', () => {
    it('includes empty user keybinding rules by default', () => {
        expect(DEFAULT_SETTINGS.keybindings.rules).toEqual([]);
    });

    it('merges old settings without keybindings using keybinding defaults', () => {
        expect(mergeUserSettingsWithDefaults({}).keybindings.rules).toEqual([]);
    });
});
