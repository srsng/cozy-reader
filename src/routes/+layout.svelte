<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { type Snippet } from 'svelte';
	import { provide } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';

	import favicon from '$lib/assets/favicon.svg';
	import type { RootData } from './+layout';
	import { initializeTheme } from '$lib/theme/themeUtils';
	import { onMount } from 'svelte';

	import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';

	const { data, children }: { data: RootData; children: Snippet } = $props();

	provide(USER_SETTINGS, data.userSettings);

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
	<AppTitleBar />
	<main class="content-area">
		{@render children?.()}
	</main>
</div>

<style>
</style>
