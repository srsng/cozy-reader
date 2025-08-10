<script lang="ts" module>
	import type { ButtonConfig } from '$lib/settings/Layout';
	import HomeButton from './HomeButton.svelte';
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
	import CloseButton from './CloseButton.svelte';
	import CustomButton from './CustomButton.svelte';
	import { cn } from '$lib/utils';
</script>

<script lang="ts">
	const {
		appTitle,
		config,
		className = 'size-6',
		btnDsiabled = false,
		iconClass = 'size-4'
	}: {
		appTitle: string;
		config: ButtonConfig;
		className?: string;
		btnDsiabled?: boolean;
		iconClass?: string;
	} = $props();

	function getButtonProps() {
		const props: Record<string, any> = {
			name: config.name,
			className: cn(config.customProps?.className, className),
			iconClass: cn(config.customProps?.iconClass, iconClass),
			disabled: btnDsiabled
		};

		// console.log(props);
		return props;
	}

	function getTextProps() {
		const props: Record<string, any> = {
			name: config.name,
			disabled: btnDsiabled,
			appTitle
			// className: config.customProps?.className || className,
			// iconClass: config.customProps?.iconClass || iconClass
		};

		return props;
	}
</script>

{#if config.enabled}
	{#if config.type === 'app-title'}
		<AppTitleButton {...getTextProps()} />
	{:else if config.type === 'app-icon'}
		<AppIconButton {appTitle} {...getButtonProps()} />
		<!-- route btn -->
	{:else if config.type === 'home'}
		<HomeButton {...getButtonProps()} />
	{:else if config.type === 'settings'}
		<SettingsButton {...getButtonProps()} />
		<!-- func btn -->
	{:else if config.type === 'refresh'}
		<RefreshButton {...getButtonProps()} />
	{:else if config.type === 'zoom'}
		<ZoomButton {...getButtonProps()} />
	{:else if config.type === 'theme-toggle'}
		<ThemeToggleButton {...getButtonProps()} />
	{:else if config.type === 'always-on-top'}
		<AlwaysOnTopButton {...getButtonProps()} />
	{:else if config.type === 'drag'}
		<DragButton {...getButtonProps()} />
	{:else if config.type === 'minimize'}
		<MinimizeButton {...getButtonProps()} />
	{:else if config.type === 'maximize'}
		<MaximizeButton {...getButtonProps()} />
	{:else if config.type === 'close'}
		<CloseButton {...getButtonProps()} />
	{:else if config.type === 'custom'}
		<CustomButton {...getButtonProps()} />
	{/if}
{/if}
