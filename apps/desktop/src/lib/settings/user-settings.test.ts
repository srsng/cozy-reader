import { describe, expect, it, vi } from 'vitest';
import {
    appLanguageCodeFromSystemLocale,
    createDefaultUserSettings,
    DEFAULT_SETTINGS,
    mergeUserSettingsWithDefaults
} from './user-settings';

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

    it('creates first-run defaults from supported OS locales', () => {
        expect(
            createDefaultUserSettings(appLanguageCodeFromSystemLocale('en-US')).base.langCode
        ).toBe('en');
        expect(
            createDefaultUserSettings(appLanguageCodeFromSystemLocale('zh-CN')).base.langCode
        ).toBe('zh-cn');
        expect(
            createDefaultUserSettings(appLanguageCodeFromSystemLocale('fr-FR')).base.langCode
        ).toBe(DEFAULT_SETTINGS.base.langCode);
    });

    it('does not let first-run OS locale override saved language settings', () => {
        const firstRunDefaults = createDefaultUserSettings(
            appLanguageCodeFromSystemLocale('en-US')
        );
        const settings = mergeUserSettingsWithDefaults(
            {
                base: {
                    ...firstRunDefaults.base,
                    langCode: 'zh-cn'
                }
            },
            firstRunDefaults
        );

        expect(settings.base.langCode).toBe('zh-cn');
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

        expect(settings.layout.layoutConfigs.titlebar.left[0].contributionId).toBe('navigate.home');
        expect(settings.layout.layoutConfigs.footbar).toBeDefined();
        expect(settings.layout.layoutConfigs.sidebar).toBeDefined();
    });
});
