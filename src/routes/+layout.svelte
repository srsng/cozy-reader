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
	// import { Toaster } from '$lib/components/ui/sonner';

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
<!-- <Toaster /> -->

<div class="app-layout" role="application" oncontextmenu={(e) => e.preventDefault()}>
	<AppTitleBar />
	<main class="content-area">
		{@render children?.()}
	</main>
</div>

<style>
	.content-area {
		/* 为标题栏留出空间，标题栏高度为 2rem (32px) */
		margin-top: 2rem;
		/* 设置内容区域高度，避免不必要的滚动 */
		height: calc(100vh - 2rem);
		/* 只在内容超出时才滚动 */
		overflow-y: auto;
		/* 确保内容区域有正确的背景色 */
		background-color: hsl(var(--background));
	}

	.app-layout {
		/* 确保布局占满整个视口 */
		height: 100vh;
		overflow: hidden;
		/* 确保布局有正确的背景色 */
		background-color: hsl(var(--background));
	}
</style>
