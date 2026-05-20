import { getPlatformInfoSnapshot } from '$lib/apis/platform';
import {
    DEFAULT_PLATFORM_INFO,
    getThemeEffectAvailability,
    type PlatformInfo
} from '$lib/platform';
import type { AppThemeEffects } from '$lib/settings/Theme';

export const APP_TITLE = 'Cozy Reader';

export type ThemeEffectAvailability = Record<Exclude<AppThemeEffects, 'none'>, boolean>;

export type AppState = {
    appTitle: string;
    platform: PlatformInfo;
    ui: {
        commandPaletteOpen: boolean;
        dialogOpen: boolean;
        textInputFocus: boolean;
    };
    window: {
        devtoolsAvailable: boolean;
        fullscreen: boolean;
    };
    theme: {
        effectAvailability: ThemeEffectAvailability;
    };
};

export const DEFAULT_APP_STATE: AppState = {
    appTitle: APP_TITLE,
    platform: DEFAULT_PLATFORM_INFO,
    ui: {
        commandPaletteOpen: false,
        dialogOpen: false,
        textInputFocus: false
    },
    window: {
        devtoolsAvailable: false,
        fullscreen: false
    },
    theme: {
        effectAvailability: {
            acrylic: false,
            blur: false,
            mica: false
        }
    }
};

export function createDefaultAppState(): AppState {
    return structuredClone(DEFAULT_APP_STATE);
}

export function createInitialAppStateSnapshot(): AppState {
    const platform = getPlatformInfoSnapshot();
    const state = createDefaultAppState();

    return {
        ...state,
        platform,
        window: {
            ...state.window,
            fullscreen: typeof document !== 'undefined' && Boolean(document.fullscreenElement)
        },
        theme: {
            ...state.theme,
            effectAvailability: getThemeEffectAvailability(platform)
        }
    };
}
