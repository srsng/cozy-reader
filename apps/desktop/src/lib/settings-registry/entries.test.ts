import { describe, expect, it, vi } from 'vitest';
import { createTestSettings } from '$lib/testing';
import {
    createSettingsContextSnapshot,
    getEntriesByTab,
    normalizeSettingValue,
    searchEntries
} from './index';

vi.mock('mode-watcher', () => ({
    mode: { current: 'system' }
}));

describe('settings registry schema adapter', () => {
    it('creates disabled search entries for settings hidden by conditions', () => {
        const settings = createTestSettings();
        settings.theme.type = 'standard';

        const results = searchEntries('色相', settings);
        const hueEntry = results
            .get('theme')
            ?.find((entry) => entry.key === 'theme.data.four_colors.hue');

        expect(hueEntry?.disabled).toBe(true);
        expect(hueEntry?.disabledReason).toBe('仅在四色主题下可用');
        expect(hueEntry?.condition?.expression).toBe('config.theme.type == "four_colors"');
    });

    it('hides conditionally unavailable settings in normal tab mode', () => {
        const settings = createTestSettings();
        settings.theme.type = 'standard';

        const entries = getEntriesByTab('theme', settings);

        expect(entries.some((entry) => entry.key === 'theme.data.four_colors.hue')).toBe(false);
        expect(entries.some((entry) => entry.key === 'theme.data.standard.name')).toBe(true);
    });

    it('creates config-prefixed context keys for setting conditions', () => {
        const settings = createTestSettings();
        settings.theme.type = 'pony';

        expect(createSettingsContextSnapshot(settings)['config.theme.type']).toBe('pony');
        expect(createSettingsContextSnapshot(settings)['config.base.zoom']).toBe(1);
    });

    it('searches setting keys, tags, feature groups, and enum labels', () => {
        const settings = createTestSettings();

        expect(searchEntries('@id:reader.fontSize', settings).get('reader')?.[0]?.key).toBe(
            'reader.fontSize'
        );
        expect(
            searchEntries('@tag:opacity', settings)
                .get('base')
                ?.map((entry) => entry.key)
        ).toContain('base.uiOpacity');
        expect(
            searchEntries('@feature:字体', settings)
                .get('reader')
                ?.map((entry) => entry.key)
        ).toContain('reader.fontFamily');
        expect(
            searchEntries('跟随系统', settings)
                .get('theme')
                ?.map((entry) => entry.key)
        ).toContain('theme.mode');
    });

    it('supports @modified based on schema defaults', () => {
        const settings = createTestSettings();
        settings.reader.fontSize = 24;

        const modifiedKeys = searchEntries('@modified', settings)
            .get('reader')
            ?.map((entry) => entry.key);

        expect(modifiedKeys).toContain('reader.fontSize');
    });

    it('normalizes number bounds and enum values before committing', () => {
        const settings = createTestSettings();
        const fontSizeSchema = getEntriesByTab('reader', settings).find(
            (entry) => entry.key === 'reader.fontSize'
        )?.schema;
        const themeTypeSchema = getEntriesByTab('theme', settings).find(
            (entry) => entry.key === 'theme.type'
        )?.schema;

        expect(fontSizeSchema && normalizeSettingValue(fontSizeSchema, 999)).toBe(48);
        expect(themeTypeSchema && normalizeSettingValue(themeTypeSchema, 'unknown')).toBe(
            'standard'
        );
    });
});
