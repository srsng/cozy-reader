import type { Arch, Family, OsType, Platform } from '@tauri-apps/plugin-os';

export type PlatformFamily = Family | 'mobile' | 'unknown';
export type PlatformType = OsType | 'unknown';
export type PlatformName = Platform | 'unknown';

export type PlatformInfo = {
    type: PlatformType;
    name: PlatformName;
    family: PlatformFamily;
    arch: Arch | 'unknown';
    version: string;
    eol: string;
    exeExtension: string;
};

export const DEFAULT_PLATFORM_INFO: PlatformInfo = {
    type: 'unknown',
    name: 'unknown',
    family: 'unknown',
    arch: 'unknown',
    version: '',
    eol: '\n',
    exeExtension: ''
};
