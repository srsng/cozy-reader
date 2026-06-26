<script lang="ts" module>
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import { CONTEXT_KEY_SERVICE } from '$lib/context-keys';
    import { keybindingManager } from '$lib/keybindings/keybindingManager';
    import { createRouteContextProjection } from '$lib/state/contextSnapshot';
    import { APP_STATE, setAppTextInputFocus } from '$lib/stores/appState';
    import { inject } from '$lib/utils/context';
    import { createDeferredInvalidation } from '$lib/utils/deferredInvalidation';
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
        let nextTextInputFocus = false;
        const textInputFocusInvalidation = createDeferredInvalidation(() => {
            setAppTextInputFocus(appState, nextTextInputFocus);
        });
        const scheduleTextInputFocus = (focused: boolean) => {
            nextTextInputFocus = focused;
            textInputFocusInvalidation.schedule();
        };
        const textInputUpdater = keybindingManager.setTextInputFocusUpdater(scheduleTextInputFocus);
        const isTextInput = (target: EventTarget | null): boolean => {
            if (!(target instanceof HTMLElement)) return false;
            return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
        };
        const updateTextInputFocus = () => {
            scheduleTextInputFocus(isTextInput(document.activeElement));
        };
        const handleFocusChange = () => {
            updateTextInputFocus();
            requestAnimationFrame(updateTextInputFocus);
        };

        updateTextInputFocus();
        document.addEventListener('focusin', handleFocusChange, true);
        document.addEventListener('focusout', handleFocusChange, true);

        return () => {
            textInputFocusInvalidation.dispose();
            textInputUpdater.dispose();
            document.removeEventListener('focusin', handleFocusChange, true);
            document.removeEventListener('focusout', handleFocusChange, true);
        };
    });
</script>
