<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { setContext, type Snippet } from 'svelte';
	import { SETTINGS } from '$lib/settings';
	import favicon from '$lib/assets/favicon.svg';
	import type { RootData } from './+layout';
	import { initializeTheme } from '$lib/theme/themeUtils';
	import { onMount } from 'svelte';

	import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';

	const { data, children }: { data: RootData; children: Snippet } = $props();

	setContext(SETTINGS, data.userSettings);

	// 只读，用于设置主题属性
	const { userSettings } = data;

	onMount(() => {
		// 初始化主题
		initializeTheme($userSettings.theme.type, $userSettings.theme.data.four_colors.hue);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode={$userSettings.theme.mode} defaultTheme={$userSettings.theme.type} />

<div class="app-layout" role="application">
	<AppTitleBar></AppTitleBar>
	{@render children?.()}
</div>
