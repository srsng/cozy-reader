<script lang="ts">
    import '../app.css';
    // types
    import type { LayoutData } from './$types';
    import { type Snippet } from 'svelte';
    // tool funcs
    import { afterNavigate } from '$app/navigation';
    import { provide } from '$lib/utils/context';
    import { onMount } from 'svelte';
    import { updatePageHistory } from '$lib/utils/route.svelte';
    // stores
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { APP_STATE, initAppState } from '$lib/stores/appState';
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { page } from '$app/state';
    // background functions
    import BackgroundAction from '$lib/components/action/background-action.svelte';
    // animation func
    import { startWindowTiltUpAnimation } from '$lib/animation';

    // services
    import { ShortcutService, SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';
    
    import { keybindingManager } from '$lib/keybindings/keybindingManager';

    // tool components
    import ThemeAction from '$lib/components/action/theme-action.svelte';
    import ZoomInOutMenuAction from '$lib/components/action/zoom-menu-action.svelte';
    import WindowAction from '$lib/components/action/window-action.svelte';
    import KeybindingsAction from '$lib/components/action/keybindings-action.svelte';
    import UIOpacityAction from '$lib/components/action/ui-opacity-action.svelte';
    import { Toaster } from '$ui/sonner';

    // ui components
    import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';
    import { ScrollArea } from '$ui/scroll-area';

    const { data, children }: { data: LayoutData; children: Snippet } = $props();

    const appState = initAppState();
    const { userSettings } = data;

    provide(APP_STATE, appState);
    provide(USER_SETTINGS, userSettings);
    provide(READER_SETTINGS, data.readerSettings);

    // shortcut service
    const shortcutService = new ShortcutService(data.tauri);
    provide(SHORTCUT_SERVICE, shortcutService);
    $effect(() => shortcutService.listen());

    // utils/route 监听路由
    $effect(() => {
        const currentPath = page.url.pathname;
        updatePageHistory(currentPath);
    });

    afterNavigate((navigation) => {
        const nextUrl = navigation.to?.url ?? page.url;
        contextKeys.set('route', nextUrl.pathname);
        updatePageHistory(nextUrl, navigation);
    });

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
<KeybindingsAction />
<UIOpacityAction />

<div class="app-layout" role="application">
    <AppTitleBar className="header" />
    <ScrollArea class="main-area">
        {@render children?.()}
    </ScrollArea>

    <!-- 侧栏通过aside-l aside-r设定 -->
    <!-- <div class="aside-l"></div> -->
    <!-- <div class="aside-r"></div> -->
    <div class="footer"></div>
</div>

<Toaster />

<!-- todo: 根据AppTitleBar是否存在动态调整mt等样式 -->

<style></style>
