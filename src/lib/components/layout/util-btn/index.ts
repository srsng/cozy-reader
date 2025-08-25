import type { ButtonType } from '$lib/settings/Layout';
import type { Component } from 'svelte';

import HomeButton from './HomeButton.svelte';
import BackButton from './BackButton.svelte';
import SettingsButton from './SettingsButton.svelte';
import RefreshButton from './RefreshButton.svelte';
import ZoomButton from './ZoomButton.svelte';
import AppIconButton from './AppIconButton.svelte';
import AppTitleButton from './AppTitleButton.svelte';
import ThemeToggleButton from './ThemeToggleButton.svelte';
import AlwaysOnTopButton from './AlwaysOnTopButton.svelte';
import DragButton from './DragButton.svelte';
import MinimizeButton from './MinimizeButton.svelte';
import MaximizeButton from './MaximizeButton.svelte';
import FullscreenButton from './FullscreenButton.svelte';
import CloseButton from './CloseButton.svelte';
import CustomButton from './CustomButton.svelte';

export const UtilButton: Record<ButtonType, Component> = {
	home: HomeButton,
	back: BackButton,
	'app-icon': AppIconButton,
	'app-title': AppTitleButton,
	settings: SettingsButton,
	refresh: RefreshButton,
	'always-on-top': AlwaysOnTopButton,
	close: CloseButton,
	minimize: MinimizeButton,
	maximize: MaximizeButton,
	'theme-toggle': ThemeToggleButton,
	drag: DragButton,
	zoom: ZoomButton,
	custom: CustomButton,
	fullscreen: FullscreenButton
};

export default UtilButton;
