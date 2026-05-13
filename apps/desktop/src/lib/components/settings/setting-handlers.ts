import { emit } from '@tauri-apps/api/event';
import { mode, resetMode, setMode } from 'mode-watcher';
import { setLocale } from '$lib/paraglide/runtime';
import type { UserSettings } from '$lib/settings';
import type { AppLanguageCode } from '$lib/settings/Base';
import type { AppThemeMode, AppThemeType, StdTDName } from '$lib/settings/Theme';
import { applyFourColorsHue, applyThemeType } from '$lib/theme/themeUtils';
import { updateName } from '$lib/theme/standard';
import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
import { setNestedValue, type SettingKey, type SettingViewModel } from '$lib/settings-registry';
import { SHORTCUT_EVENT } from '$lib/shortcuts/shortcutService';

export type SettingHandlerContext = {
    settings: UserSettings;
};

export type SettingActionKey = SettingKey | 'zoom.event' | 'theme.effects.event';
type SettingHandler = (entry: SettingViewModel, value: unknown, context: SettingHandlerContext) => void;

export const settingHandlers: Partial<Record<SettingActionKey, SettingHandler>> = {
    'base.langCode': (entry, value, { settings }) => {
        const langCode = value as AppLanguageCode;
        setNestedValue(settings as unknown as Record<string, unknown>, entry.key, langCode);
        setLocale(langCode);
    },
    'base.alwaysOnTop': (entry, value, { settings }) => {
        setNestedValue(settings as unknown as Record<string, unknown>, entry.key, value);
        emitMainWindowEvent('toggle-always-on-top');
    },
    'theme.mode': (entry, value, { settings }) => {
        const nextMode = value as AppThemeMode;
        setNestedValue(settings as unknown as Record<string, unknown>, entry.key, nextMode);

        if (nextMode === 'system') resetMode();
        else setMode(nextMode);
    },
    'theme.type': (entry, value, { settings }) => {
        const themeType = value as AppThemeType;
        setNestedValue(settings as unknown as Record<string, unknown>, entry.key, themeType);
        applyThemeType(themeType);
    },
    'theme.data.standard.name': (entry, value, { settings }) => {
        const themeName = value as StdTDName;
        updateName(themeName);
        setNestedValue(settings as unknown as Record<string, unknown>, entry.key, themeName);
    },
    'theme.data.four_colors.hue': (entry, value, { settings }) => {
        const hue = Number(value);
        setNestedValue(settings as unknown as Record<string, unknown>, entry.key, hue);
        applyFourColorsHue(hue);
    },
    'zoom.event': (_entry, value) => {
        emit(SHORTCUT_EVENT, value as string);
    },
    'theme.effects.event': (_entry, value) => {
        emit(SHORTCUT_EVENT, `theme-effects-${value}`);
    }
};

export function hasSettingHandler(name: SettingActionKey): boolean {
    return Boolean(settingHandlers[name]);
}

export function runSettingHandler(
    name: SettingActionKey,
    entry: SettingViewModel,
    value: unknown,
    context: SettingHandlerContext
) {
    const handler = settingHandlers[name];
    if (!handler) {
        console.warn(`Missing setting handler: ${name}`);
        return;
    }

    handler(entry, value, context);
}

export function getCurrentThemeMode() {
    return mode.current;
}
