import type { ButtonType } from '$lib/settings/Layout';
import type { Component } from 'svelte';

import GoHomeButton from './go-home.svelte';
import GoBackButton from './go-back.svelte';
import GOSettingsButton from './go-settings.svelte';
import GoBackgroundSettingsButton from './go-bg-settings.svelte';
import AppIconButton from './app-icon.svelte';
import AppTitleButton from './app-title.svelte';
import AppDragButton from './app-drag.svelte';
import RefreshButton from './main-window-refresh.svelte';
import AlwaysOnTopButton from './main-window-alway-on-top.svelte';
import MinimizeButton from './main-window-min.svelte';
import MaximizeButton from './main-window-max.svelte';
import FullscreenButton from './main-window-fullscreen.svelte';
import CloseButton from './main-window-close.svelte';
import ThemeToggleButton from './theme-toggle.svelte';
import ZoomButton from './zoom-popover.svelte';
import CustomButton from './custom.svelte';

export const UtilButton: Record<ButtonType, Component> = {
    // btns for app info
    'app-icon': AppIconButton,
    'app-title': AppTitleButton,
    // btns for route
    home: GoHomeButton,
    back: GoBackButton,
    drag: AppDragButton,
    settings: GOSettingsButton,
    'background-settings': GoBackgroundSettingsButton,
    // btns for main window
    refresh: RefreshButton,
    'always-on-top': AlwaysOnTopButton,
    close: CloseButton,
    minimize: MinimizeButton,
    maximize: MaximizeButton,
    fullscreen: FullscreenButton,
    // other utils
    'theme-toggle': ThemeToggleButton,
    zoom: ZoomButton,
    // not sure
    custom: CustomButton
};

export default UtilButton;
