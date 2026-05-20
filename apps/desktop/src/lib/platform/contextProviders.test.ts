import { describe, expect, it } from 'vitest';
import { ContextKey } from '$lib/context-keys';
import type { PlatformInfo } from './types';
import { getThemeEffectAvailability } from './contextProviders';
import { createPlatformInfoContextSnapshot } from './contextKeys';

const baseInfo: PlatformInfo = {
    type: 'windows',
    name: 'windows',
    family: 'windows',
    arch: 'x86_64',
    version: '11',
    eol: '\r\n',
    exeExtension: 'exe'
};

function platformInfo(overrides: Partial<PlatformInfo>): PlatformInfo {
    return {
        ...baseInfo,
        ...overrides
    };
}

describe('platform context snapshots and availability', () => {
    it('creates VS Code style platform fact context keys', () => {
        const snapshot = createPlatformInfoContextSnapshot(baseInfo);

        expect(snapshot[ContextKey.IsWindows]).toBe(true);
        expect(snapshot[ContextKey.IsMac]).toBe(false);
        expect(snapshot[ContextKey.IsDesktop]).toBe(true);
        expect(snapshot[ContextKey.IsMobile]).toBe(false);
        expect(snapshot[ContextKey.PlatformType]).toBe('windows');
        expect(snapshot[ContextKey.PlatformName]).toBe('windows');
        expect(snapshot[ContextKey.PlatformVersion]).toBe('11');
    });

    it('marks Windows 11 theme effects according to Tauri window effect support', () => {
        const availability = getThemeEffectAvailability(platformInfo({ version: '10.0.22000' }));

        expect(availability.blur).toBe(true);
        expect(availability.mica).toBe(true);
        expect(availability.acrylic).toBe(true);
    });

    it('does not expose Mica on Windows 10', () => {
        const availability = getThemeEffectAvailability(platformInfo({ version: '10.0.19045' }));

        expect(availability.blur).toBe(true);
        expect(availability.mica).toBe(false);
        expect(availability.acrylic).toBe(true);
    });

    it('does not expose Windows theme effects on non-Windows platforms', () => {
        for (const info of [
            platformInfo({ type: 'linux', name: 'linux', family: 'unix' }),
            platformInfo({ type: 'macos', name: 'macos', family: 'unix' }),
            platformInfo({ type: 'android', name: 'android', family: 'mobile' }),
            platformInfo({ type: 'ios', name: 'ios', family: 'mobile' })
        ]) {
            const availability = getThemeEffectAvailability(info);

            expect(availability.blur).toBe(false);
            expect(availability.mica).toBe(false);
            expect(availability.acrylic).toBe(false);
        }
    });

    it('does not expose version-limited theme effects when Windows version is unknown', () => {
        const availability = getThemeEffectAvailability(platformInfo({ version: '' }));

        expect(availability.blur).toBe(false);
        expect(availability.mica).toBe(false);
        expect(availability.acrylic).toBe(false);
    });
});
