export type ContextKeyPrimitiveValue = boolean | number | string | null | undefined;

export type ContextKeyValue =
    | ContextKeyPrimitiveValue
    | readonly ContextKeyPrimitiveValue[]
    | Record<string, ContextKeyPrimitiveValue>;

export type ContextKeySnapshot = Record<string, ContextKeyValue>;

export type ContextKeyExpression = string | undefined;

export type ContextKeyProjection = {
    id: string;
    getSnapshot: () => ContextKeySnapshot;
    subscribe?: (emit: () => void) => (() => void) | { dispose(): void };
};

export type ContextKeyInspection = {
    expression: ContextKeyExpression;
    matches: boolean;
    referencedKeys: readonly string[];
    snapshot: ContextKeySnapshot;
    error?: Error;
};

export const ContextKey = {
    CommandPaletteOpen: 'commandPaletteOpen',
    DialogOpen: 'dialogOpen',
    Route: 'route',
    TextInputFocus: 'textInputFocus',
    ThemeEffects: 'themeEffects',
    IsWindows: 'isWindows',
    IsMac: 'isMac',
    IsLinux: 'isLinux',
    IsAndroid: 'isAndroid',
    IsIOS: 'isIOS',
    IsMobile: 'isMobile',
    IsDesktop: 'isDesktop',
    PlatformType: 'platform.type',
    PlatformName: 'platform.name',
    PlatformVersion: 'platform.version',
    WindowAlwaysOnTop: 'window.alwaysOnTop',
    WindowDevtoolsAvailable: 'window.devtoolsAvailable',
    WindowFullscreen: 'window.fullscreen',
    ThemeEffectBlurAvailable: 'theme.effect.blurAvailable',
    ThemeEffectMicaAvailable: 'theme.effect.micaAvailable',
    ThemeEffectAcrylicAvailable: 'theme.effect.acrylicAvailable'
} as const;

export type ContextKey = (typeof ContextKey)[keyof typeof ContextKey];
