import { describe, expect, it, vi } from 'vitest';
import { LogLevel } from '$lib/types';
import { getEntriesByTab, normalizeSettingValue, searchEntries } from './index';
import type { SettingsSnapshot } from './types';

vi.mock('mode-watcher', () => ({
    mode: { current: 'system' }
}));

function createSettings(): SettingsSnapshot {
    return {
        base: {
            langCode: 'zh-cn',
            logLevel: LogLevel.info,
            zoom: 1,
            alwaysOnTop: false,
            uiOpacity: 0.88,
            bodyTransparent: 1,
            layoutControlsOutline: true
        },
        layout: {
            titlebar: true,
            header: true,
            footer: true,
            layoutConfigs: {
                titlebar: { left: [], center: [], right: [] },
                footbar: { left: [], center: [], right: [] },
                sidebar: { left: [], center: [], right: [] }
            }
        },
        theme: {
            mode: 'system',
            type: 'standard',
            data: {
                standard: { name: 'black' },
                four_colors: { hue: 36 },
                pony: { name: 'sg' }
            },
            effects: 'none'
        },
        reader: {
            fontFamily: '',
            viewerWidth: 60,
            fontSize: 20,
            lineHeight: 180,
            firstLineIndent: false,
            zoomLongPic: false,
            scrollBarVisable: false
        },
        background: {} as SettingsSnapshot['background']
    };
}

describe('settings registry schema adapter', () => {
    it('creates disabled search entries for settings hidden by conditions', () => {
        const settings = createSettings();
        settings.theme.type = 'standard';

        const results = searchEntries('色相', settings);
        const hueEntry = results.get('theme')?.find((entry) => entry.key === 'theme.data.four_colors.hue');

        expect(hueEntry?.disabled).toBe(true);
        expect(hueEntry?.disabledReason).toBe('仅在四色主题下可用');
    });

    it('hides conditionally unavailable settings in normal tab mode', () => {
        const settings = createSettings();
        settings.theme.type = 'standard';

        const entries = getEntriesByTab('theme', settings);

        expect(entries.some((entry) => entry.key === 'theme.data.four_colors.hue')).toBe(false);
        expect(entries.some((entry) => entry.key === 'theme.data.standard.name')).toBe(true);
    });

    it('searches setting keys, tags, feature groups, and enum labels', () => {
        const settings = createSettings();

        expect(searchEntries('@id:reader.fontSize', settings).get('reader')?.[0]?.key).toBe(
            'reader.fontSize'
        );
        expect(searchEntries('@tag:opacity', settings).get('base')?.map((entry) => entry.key)).toContain(
            'base.uiOpacity'
        );
        expect(searchEntries('@feature:字体', settings).get('reader')?.map((entry) => entry.key)).toContain(
            'reader.fontFamily'
        );
        expect(searchEntries('跟随系统', settings).get('theme')?.map((entry) => entry.key)).toContain(
            'theme.mode'
        );
    });

    it('supports @modified based on schema defaults', () => {
        const settings = createSettings();
        settings.reader.fontSize = 24;

        const modifiedKeys = searchEntries('@modified', settings)
            .get('reader')
            ?.map((entry) => entry.key);

        expect(modifiedKeys).toContain('reader.fontSize');
    });

    it('normalizes number bounds and enum values before committing', () => {
        const settings = createSettings();
        const fontSizeSchema = getEntriesByTab('reader', settings).find(
            (entry) => entry.key === 'reader.fontSize'
        )?.schema;
        const themeTypeSchema = getEntriesByTab('theme', settings).find(
            (entry) => entry.key === 'theme.type'
        )?.schema;

        expect(fontSizeSchema && normalizeSettingValue(fontSizeSchema, 999)).toBe(48);
        expect(themeTypeSchema && normalizeSettingValue(themeTypeSchema, 'unknown')).toBe('standard');
    });
});
