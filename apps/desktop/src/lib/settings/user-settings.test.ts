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

    it('deep merges legacy layout config and migrates titlebar buttons', () => {
        const settings = mergeUserSettingsWithDefaults({
            layout: {
                titlebar: true,
                header: true,
                footer: true,
                layoutConfigs: {
                    titlebar: {
                        left: [{ name: 'home', type: 'home', enabled: true, order: 0 }]
                    }
                }
            } as any
        });

        expect(settings.layout.layoutConfigs.titlebar.left[0].contributionId).toBe(
            'navigate.home'
        );
        expect(settings.layout.layoutConfigs.footbar).toBeDefined();
        expect(settings.layout.layoutConfigs.sidebar).toBeDefined();
    });
});
