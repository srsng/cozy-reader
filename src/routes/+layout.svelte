<script lang="ts">
	import '../app.css';
	// types
	import type { LayoutData } from './$types';
	import { type Snippet } from 'svelte';
	// tool funcs
	import { provide } from '$lib/utils/context';
	import { onMount } from 'svelte';
	import { updatePageHistory } from '$lib/utils/route.svelte';
	// stores
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { APP_STATE, initAppState } from '$lib/stores/appState';
	import { page } from '$app/state';
	// background functions
	import BackgroundAction from '$lib/components/action/background-action.svelte';
	// animation func
	import { startWindowTiltUpAnimation } from '$lib/animation';

	// services
	import { ShortcutService, SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';

	// tool components
	import ThemeAction from '$lib/components/action/theme-action.svelte';
	import ZoomInOutMenuAction from '$lib/components/action/ZoomInOutMenuAction.svelte';
	import WindowAction from '$lib/components/action/window-action.svelte';
	import HotkeysAction from '$lib/components/action/HotkeysAction.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	// ui components
	import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	const { data, children }: { data: LayoutData; children: Snippet } = $props();

	provide(APP_STATE, initAppState());
	provide(USER_SETTINGS, data.userSettings);

	// shortcut service
	const shortcutService = new ShortcutService(data.tauri);
	provide(SHORTCUT_SERVICE, shortcutService);
	$effect(() => shortcutService.listen());

	// utils/route 监听路由
	$effect(() => {
		const currentPath = page.url.pathname;
		updatePageHistory(currentPath);
	});

	const { userSettings } = data;

	onMount(() => {
		// 启动窗口入场动画
		startWindowTiltUpAnimation();
	});
</script>

<svelte:head>
	<title>{page.data.metaData.title}</title>
	<meta name="description" content={page.data.metaData.description} />
</svelte:head>

<svelte:body />
<!-- <svelte:document transition:scale /> -->

<ThemeAction />
<ZoomInOutMenuAction />
<WindowAction />
<BackgroundAction />
<HotkeysAction />

<div class="app-layout" role="application" style:--ui-opacity={$userSettings.base.uiOpacity}>
	<AppTitleBar />
	<ScrollArea class="content-area">
		{@render children?.()}
	</ScrollArea>
</div>

<Toaster />

<!-- todo: 根据AppTitleBar是否存在动态调整mt等样式 -->

<style></style>
