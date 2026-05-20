import type { PlatformInfo } from './types';
import type { AppThemeEffects } from '$lib/settings/Theme';

export function getThemeEffectAvailability(
    info: PlatformInfo
): Record<Exclude<AppThemeEffects, 'none'>, boolean> {
    return {
        acrylic: isWindows10OrLater(info),
        blur: isWindowsBlurSupported(info),
        mica: isWindows11(info)
    };
}

type ParsedWindowsVersion = {
    major: number;
    minor?: number;
    build?: number;
};

function isWindows11(info: PlatformInfo): boolean {
    const version = parseWindowsVersion(info);
    if (!version) return false;
    if (version.major >= 11) return true;
    return version.major === 10 && typeof version.build === 'number' && version.build >= 22000;
}

function isWindows10OrLater(info: PlatformInfo): boolean {
    const version = parseWindowsVersion(info);
    if (!version) return false;
    if (version.major >= 11) return true;
    return version.major === 10;
}

function isWindowsBlurSupported(info: PlatformInfo): boolean {
    const version = parseWindowsVersion(info);
    if (!version) return false;

    const isWindows7 = version.major === 6 && version.minor === 1;
    if (isWindows7) return true;
    if (version.major !== 10) return false;

    const build = version.build;
    if (build === undefined) return true;
    if (build < 22000) return true;

    return build < 22621;
}

function parseWindowsVersion(info: PlatformInfo): ParsedWindowsVersion | null {
    if (info.type !== 'windows') return null;

    const parts = info.version
        .split(/[^\d]+/)
        .filter(Boolean)
        .map((part) => Number(part));

    if (parts.length === 0 || parts.some((part) => Number.isNaN(part))) return null;

    return {
        major: parts[0],
        minor: parts[1],
        build: parts[2]
    };
}
