<script lang="ts" module>
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import { CONTEXT_KEY_SERVICE } from '$lib/context-keys';
    import { keybindingManager } from '$lib/keybindings/keybindingManager';
    import { createRouteContextProjection } from '$lib/state/contextSnapshot';
    import { APP_STATE, setAppTextInputFocus } from '$lib/stores/appState';
    import { inject } from '$lib/utils/context';
    import { updatePageHistory } from '$lib/utils/route.svelte';
    import { onDestroy, onMount } from 'svelte';
</script>

<script lang="ts">
    const appState = inject(APP_STATE);
    const contextKeys = inject(CONTEXT_KEY_SERVICE);
    let currentPath: string = page.url.pathname;
    let routeProjectionEmit: (() => void) | undefined;
    const routeProjection = contextKeys.registerProjection(
        createRouteContextProjection({
            getPath: () => currentPath,
            subscribe: (emit) => {
                routeProjectionEmit = emit;
                return () => {
                    routeProjectionEmit = undefined;
                };
            }
        })
    );

    afterNavigate((navigation) => {
        const nextUrl = navigation.to?.url ?? page.url;
        currentPath = nextUrl.pathname;
        routeProjectionEmit?.();
        updatePageHistory(nextUrl, navigation);
    });

    onDestroy(() => routeProjection.dispose());

    onMount(() => {
        const textInputUpdater = keybindingManager.setTextInputFocusUpdater((focused) => {
            setAppTextInputFocus(appState, focused);
        });
        const isTextInput = (target: EventTarget | null): boolean => {
            if (!(target instanceof HTMLElement)) return false;
            return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
        };
        const updateTextInputFocus = () => {
            setAppTextInputFocus(appState, isTextInput(document.activeElement));
        };
        const handleFocusChange = () => {
            updateTextInputFocus();
            requestAnimationFrame(updateTextInputFocus);
        };

        updateTextInputFocus();
        document.addEventListener('focusin', handleFocusChange, true);
        document.addEventListener('focusout', handleFocusChange, true);

        return () => {
            textInputUpdater.dispose();
            document.removeEventListener('focusin', handleFocusChange, true);
            document.removeEventListener('focusout', handleFocusChange, true);
        };
    });
</script>
