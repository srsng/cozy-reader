<script lang="ts">
    import type { Snippet } from 'svelte';
    import { onMount } from 'svelte';
    import { COMMAND_ROUTER, createDefaultCommandContext } from '$lib/commands';
    import { CONTEXT_KEY_SERVICE } from '$lib/context-keys';
    import { keybindingManager } from '$lib/keybindings/keybindingManager';
    import { MENU_SERVICE } from '$lib/menus';
    import { activateReaderCommands } from '$lib/reader/commands';
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { APP_STATE } from '$lib/stores/appState';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';

    const { children }: { children: Snippet } = $props();

    const appState = inject(APP_STATE);
    const commandRouter = inject(COMMAND_ROUTER);
    const contextKeys = inject(CONTEXT_KEY_SERVICE);
    const menuService = inject(MENU_SERVICE);
    const readerSettings = inject(READER_SETTINGS);
    const userSettings = inject(USER_SETTINGS);

    onMount(() => {
        const readerCommands = activateReaderCommands({
            commandRouter,
            contextKeys,
            createCommandServiceContext: () =>
                createDefaultCommandContext({
                    appState,
                    contextKeys,
                    userSettings
                }),
            keybindingManager,
            menuService,
            readerSettings
        });

        return () => {
            readerCommands.dispose();
        };
    });
</script>

{@render children?.()}
