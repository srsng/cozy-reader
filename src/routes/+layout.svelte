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
	// background functions
	import {
		generateBackgroundStyles,
		applyBackgroundStyles,
		removeBackgroundStyles
	} from '$lib/components/action/background-action.svelte';

	// services
	import { ShortcutService, SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';

	// tool components
	import { ModeWatcher } from 'mode-watcher';
	import ZoomInOutMenuAction from '$lib/components/action/ZoomInOutMenuAction.svelte';
	import WindowAction from '$lib/components/action/window-action.svelte';

	// ui components
	import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { scale } from 'svelte/transition';

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

	// 背景相关状态
	// svelte-ignore non_reactive_update
	let contentAreaElement: HTMLDivElement | null = null;

	// 获取当前激活的背景图片
	const activeImage = $derived(
		$userSettings.background.images.find((img) => img.id === $userSettings.background.activeImageId)
	);

	// 应用背景样式
	function applyBackgroundToContentArea() {
		if (!contentAreaElement) return;

		if (activeImage) {
			const styles = generateBackgroundStyles(activeImage, $userSettings.background.global);
			applyBackgroundStyles(contentAreaElement, styles);
		} else {
			removeBackgroundStyles(contentAreaElement);
		}
	}

	// 监听背景设置变化
	$effect(() => {
		// 当背景设置发生变化时重新应用样式
		if (activeImage || $userSettings.background.activeImageId === null) {
			applyBackgroundToContentArea();
		}
	});

	onMount(() => {
		// 初始化主题
		initializeTheme($userSettings.theme.type, $userSettings.theme.data);

		// 初始化背景
		applyBackgroundToContentArea();
	});
</script>

<!-- <svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head> -->

<ModeWatcher defaultMode={$userSettings.theme.mode} defaultTheme={$userSettings.theme.type} />
<ZoomInOutMenuAction />
<WindowAction />

<svelte:body
	transition:scale
	style:--data_theme_4colors_hue={$userSettings.theme.data.four_colors.hue}
	style:--data_theme_std_name={$userSettings.theme.data.standard.name}
/>
<!-- <svelte:document transition:scale /> -->

<div class="app-layout" role="application" oncontextmenu={(e) => e.preventDefault()}>
	<AppTitleBar />
	<ScrollArea class="content-area" bind:ref={contentAreaElement}>
		{@render children?.()}
	</ScrollArea>
</div>

<style></style>
