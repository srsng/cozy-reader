<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { type Snippet } from 'svelte';
	import { provide } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { ShortcutService, SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';

	// import favicon from '$lib/assets/favicon.svg';
	import type { RootData } from './+layout';
	import { initializeTheme } from '$lib/theme/themeUtils';
	import { onMount } from 'svelte';

	import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';
	import ZoomInOutMenuAction from '$lib/components/action/ZoomInOutMenuAction.svelte';
	import WindowAction from '$lib/components/action/window-action.svelte';
	import { page } from '$app/state';
	import { updatePageHistory } from '$lib/utils/route.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	const { data, children }: { data: RootData; children: Snippet } = $props();

	// 只读，用于设置主题属性
	const { userSettings } = data;
	provide(USER_SETTINGS, data.userSettings);

	const shortcutService = new ShortcutService(data.tauri);
	provide(SHORTCUT_SERVICE, shortcutService);

	// shortcut service
	$effect(() => shortcutService.listen());

	// 监听路由
	$effect(() => {
		const currentPath = page.url.pathname;
		updatePageHistory(currentPath);
	});

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
