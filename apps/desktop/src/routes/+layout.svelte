<script lang="ts">
    import '../app.css';
    // types
    import type { LayoutData } from './$types';
    import { type Snippet } from 'svelte';
    // tool funcs
    import { provide } from '$lib/utils/context';
    import { onDestroy } from 'svelte';
    import { tiltUp } from '$lib/animation';
    import { scale } from 'svelte/transition';

    // stores
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { APP_STATE } from '$lib/stores/appState';
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { page } from '$app/state';

    // background functions
    import BackgroundAction from '$lib/components/action/background-action.svelte';

    // services
    import { COMMAND_ROUTER, COMMAND_SERVICE, createAppServices } from '$lib/commands';
    import { CONTEXT_KEY_SERVICE } from '$lib/context-keys';
    import { MENU_SERVICE } from '$lib/menus';

    // tool components
    import AppStateRuntime from '$lib/components/runtime/AppStateRuntime.svelte';
    import ThemeRuntime from '$lib/components/runtime/ThemeRuntime.svelte';
    import ZoomRuntime from '$lib/components/runtime/ZoomRuntime.svelte';
    import WindowRuntime from '$lib/components/runtime/WindowRuntime.svelte';
    import KeybindingRuntime from '$lib/components/runtime/KeybindingRuntime.svelte';
    import UIOpacityAction from '$lib/components/action/ui-opacity-action.svelte';
    import CommandPalette from '$lib/components/commands/CommandPalette.svelte';
    import { Toaster } from '$ui/sonner';

    // ui components
    import AppTitleBar from '$lib/components/layout/AppTitleBar.svelte';
    import { ScrollArea } from '$ui/scroll-area';

    const { data, children }: { data: LayoutData; children: Snippet } = $props();

    const { appState, userSettings, readerSettings, appServices } = data;

    provide(APP_STATE, appState);
    provide(USER_SETTINGS, userSettings);
    provide(READER_SETTINGS, readerSettings);

    provide(CONTEXT_KEY_SERVICE, appServices.contextKeys);
    provide(COMMAND_SERVICE, appServices.commandService);
    provide(COMMAND_ROUTER, appServices.commandRouter);
    provide(MENU_SERVICE, appServices.menuService);


    onDestroy(() => {
        appServices.dispose();
    });
</script>

<svelte:head>
    <title>{page.data.metaData.title}</title>
    <meta name="description" content={page.data.metaData.description} />
</svelte:head>

<svelte:body />
<!-- <svelte:document transition:scale /> -->

<AppStateRuntime />
<ThemeRuntime />
<ZoomRuntime />
<WindowRuntime />
<KeybindingRuntime />
<UIOpacityAction />
<CommandPalette />

<div class="app-viewport">
    <div class="app-layout" role="application" in:tiltUp out:scale>
        <AppTitleBar className="header" />
        <main class="main-area">
            <BackgroundAction />
            <ScrollArea class="main-area-content">
                {@render children?.()}
            </ScrollArea>
        </main>

        <!-- 侧栏通过aside-l aside-r设定 -->
        <!-- <div class="aside-l"></div> -->
        <!-- <div class="aside-r"></div> -->
        <div class="footer"></div>
    </div>
</div>

<Toaster />

<!-- todo: 根据AppTitleBar是否存在动态调整mt等样式 -->

<style></style>
