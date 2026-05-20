import {
    arch,
    eol,
    exeExtension,
    family,
    locale,
    platform,
    type as osType,
    version
} from '@tauri-apps/plugin-os';
import { DEFAULT_PLATFORM_INFO, type PlatformInfo } from '$lib/platform/types';

export function getPlatformInfoSnapshot(): PlatformInfo {
    const type = safeRead(osType, DEFAULT_PLATFORM_INFO.type);
    const osFamily = safeRead(family, DEFAULT_PLATFORM_INFO.family);

    return {
        type,
        name: safeRead(platform, DEFAULT_PLATFORM_INFO.name),
        family: normalizeFamily(type, osFamily),
        arch: safeRead(arch, DEFAULT_PLATFORM_INFO.arch),
        version: safeRead(version, DEFAULT_PLATFORM_INFO.version),
        eol: safeRead(eol, DEFAULT_PLATFORM_INFO.eol),
        exeExtension: safeRead(exeExtension, DEFAULT_PLATFORM_INFO.exeExtension)
    };
}

export function getSystemLocale(): Promise<string | null> {
    return Promise.resolve()
        .then(() => locale())
        .catch(() => null);
}

function normalizeFamily(type: string, osFamily: string): PlatformInfo['family'] {
    if (type === 'android' || type === 'ios') return 'mobile';
    if (osFamily === 'windows' || osFamily === 'unix') return osFamily;
    return 'unknown';
}

function safeRead<T>(reader: () => T, fallback: T): T {
    try {
        return reader();
    } catch {
        return fallback;
    }
}
