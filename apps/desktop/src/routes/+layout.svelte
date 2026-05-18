<script lang="ts">
    import '../app.css';
    // types
    import type { LayoutData } from './$types';
    import { type Snippet } from 'svelte';
    // tool funcs
    import { afterNavigate } from '$app/navigation';
    import { provide } from '$lib/utils/context';
    import { onDestroy, onMount } from 'svelte';
    import { updatePageHistory } from '$lib/utils/route.svelte';
    import { tiltUp } from '$lib/animation';
    import { scale } from 'svelte/transition';

    // stores
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { APP_STATE, initAppState } from '$lib/stores/appState';
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { page } from '$app/state';
    // background functions
    import BackgroundAction from '$lib/components/action/background-action.svelte';

    // services
    import {
        CommandRouter,
        COMMAND_ROUTER,
        CommandService,
        COMMAND_SERVICE,
        createDefaultCommandContext,
        registerDefaultCommands
    } from '$lib/commands';
    import { ContextKey, ContextKeyService, CONTEXT_KEY_SERVICE } from '$lib/context-keys';
    import { keybindingManager } from '$lib/keybindings/keybindingManager';
    import { MenuService, MENU_SERVICE } from '$lib/menus';
    import { registerDefaultActions } from '$lib/actions';
    import { DisposableStore } from '$lib/utils/disposable';

    // tool components
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

    const appState = initAppState();
    const { userSettings } = data;

    provide(APP_STATE, appState);
    provide(USER_SETTINGS, userSettings);
    provide(READER_SETTINGS, data.readerSettings);

    const contextKeys = new ContextKeyService({
        [ContextKey.CommandPaletteOpen]: false,
        [ContextKey.DialogOpen]: false,
        [ContextKey.Route]: page.url.pathname,
        [ContextKey.TextInputFocus]: false,
        [ContextKey.ThemeEffects]: $userSettings.theme.effects,
        [ContextKey.WindowAlwaysOnTop]: $userSettings.base.alwaysOnTop,
        [ContextKey.WindowDevtoolsAvailable]: false,
        [ContextKey.WindowFullscreen]:
            typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
    });
    const rootDisposables = new DisposableStore();
    provide(CONTEXT_KEY_SERVICE, contextKeys);

    const createCommandServiceContext = () =>
        createDefaultCommandContext({
            appState,
            contextKeys,
            userSettings
        });
    const commandService = new CommandService(createCommandServiceContext());
    const commandRouter = new CommandRouter();
    rootDisposables.add(commandRouter.registerScope('app', commandService));
    rootDisposables.add(registerDefaultCommands(commandService));
    const menuService = new MenuService(commandRouter, contextKeys);
    keybindingManager.setContextKeyService(contextKeys);
    keybindingManager.setCommandExecutor(commandRouter);
    rootDisposables.add(registerDefaultActions({ commandService, menuService, keybindingManager }));
    provide(COMMAND_SERVICE, commandService);
    provide(COMMAND_ROUTER, commandRouter);
    provide(MENU_SERVICE, menuService);

    onDestroy(() => {
        rootDisposables.dispose();
    });

    $effect(() => {
        contextKeys.set(ContextKey.WindowAlwaysOnTop, $userSettings.base.alwaysOnTop);
        contextKeys.set(ContextKey.ThemeEffects, $userSettings.theme.effects);
    });

    afterNavigate((navigation) => {
        const nextUrl = navigation.to?.url ?? page.url;
        contextKeys.set(ContextKey.Route, nextUrl.pathname);
        updatePageHistory(nextUrl, navigation);
    });

    onMount(() => {
        const isTextInput = (target: EventTarget | null): boolean => {
            if (!(target instanceof HTMLElement)) return false;
            return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
        };
        const updateTextInputFocus = () => {
            contextKeys.set(ContextKey.TextInputFocus, isTextInput(document.activeElement));
        };
        const handleFocusChange = () => {
            updateTextInputFocus();
            requestAnimationFrame(updateTextInputFocus);
        };

        updateTextInputFocus();
        document.addEventListener('focusin', handleFocusChange, true);
        document.addEventListener('focusout', handleFocusChange, true);

        return () => {
            document.removeEventListener('focusin', handleFocusChange, true);
            document.removeEventListener('focusout', handleFocusChange, true);
        };
    });
</script>

<svelte:head>
    <title>{page.data.metaData.title}</title>
    <meta name="description" content={page.data.metaData.description} />
</svelte:head>

<svelte:body />
<!-- <svelte:document transition:scale /> -->

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
