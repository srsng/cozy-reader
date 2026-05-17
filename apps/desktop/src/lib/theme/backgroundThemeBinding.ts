import type { UserSettings } from '$lib/settings';
import type { BackgroundImage, ThemeBinding } from '$lib/settings/background';
import type {
    AppThemeType,
    FourColorsThemeData,
    PonyThemeData,
    StandardThemeData
} from '$lib/settings/Theme';
import { hasThemeBinding, initializeTheme, isValidThemeBinding } from '$lib/theme/themeUtils';

export function applyThemeBindingToSettings(
    settings: UserSettings,
    themeBinding: ThemeBinding<AppThemeType>
): boolean {
    if (!isValidThemeBinding(themeBinding)) {
        console.warn('Invalid theme binding:', themeBinding);
        return false;
    }

    settings.theme.type = themeBinding.type;

    switch (themeBinding.type) {
        case 'standard':
            settings.theme.data.standard = themeBinding.data as StandardThemeData;
            break;
        case 'four_colors':
            settings.theme.data.four_colors = themeBinding.data as FourColorsThemeData;
            break;
        case 'pony':
            settings.theme.data.pony = themeBinding.data as PonyThemeData;
            break;
    }

    initializeTheme(themeBinding.type, settings.theme.data);
    return true;
}

export function applyBackgroundImageThemeBindingToSettings(
    settings: UserSettings,
    image: BackgroundImage | undefined
): boolean {
    if (!image || !hasThemeBinding(image)) return false;

    return applyThemeBindingToSettings(settings, image.themeBinding!);
}
