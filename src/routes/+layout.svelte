<script lang="ts">
	import '../app.css';
	// types
	import type { RootData } from './+layout';
	import { type Snippet } from 'svelte';
	// tool funcs
	import { provide } from '$lib/utils/context';
	import { onMount } from 'svelte';
	import { initializeTheme } from '$lib/theme/themeUtils';
	import { updatePageHistory } from '$lib/utils/route.svelte';
	// stores
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { APP_STATE, initAppState } from '$lib/stores/appState';
	import { page } from '$app/state';

	// services
	import { ShortcutService, SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';

	// tool components
	import { ModeWatcher } from 'mode-watcher';
	import ZoomInOutMenuAction from '$lib/components/action/ZoomInOutMenuAction.svelte';
	import WindowAction from '$lib/components/action/window-action.svelte';

	// ui components
	import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	const { data, children }: { data: RootData; children: Snippet } = $props();

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
		// 初始化主题
		initializeTheme($userSettings.theme.type, $userSettings.theme.data.four_colors.hue);
	});
</script>

<!-- <svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head> -->

<ModeWatcher defaultMode={$userSettings.theme.mode} defaultTheme={$userSettings.theme.type} />
<ZoomInOutMenuAction />
<WindowAction />

<div class="app-layout" role="application" oncontextmenu={(e) => e.preventDefault()}>
	<AppTitleBar />
	<ScrollArea class="content-area">
		{@render children?.()}
	</ScrollArea>
</div>

<style></style>
