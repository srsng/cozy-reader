import { ContextKey, type ContextKeySnapshot } from '$lib/context-keys';
import type { PlatformInfo } from './types';

export function createPlatformInfoContextSnapshot(info: PlatformInfo): ContextKeySnapshot {
    return {
        [ContextKey.IsWindows]: info.type === 'windows',
        [ContextKey.IsMac]: info.type === 'macos',
        [ContextKey.IsLinux]: info.type === 'linux',
        [ContextKey.IsAndroid]: info.type === 'android',
        [ContextKey.IsIOS]: info.type === 'ios',
        [ContextKey.IsMobile]: info.type === 'android' || info.type === 'ios',
        [ContextKey.IsDesktop]:
            info.type === 'windows' || info.type === 'macos' || info.type === 'linux',
        [ContextKey.PlatformType]: info.type,
        [ContextKey.PlatformName]: info.name,
        [ContextKey.PlatformVersion]: info.version
    };
}
