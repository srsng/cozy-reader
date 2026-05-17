import { CONTEXT_KEY_SERVICE, type ContextKeyService } from '$lib/context-keys';
import { retainDialogOpen } from '$lib/context-keys/modalContext';
import { injectOptional } from '$lib/utils/context';

export function useDialogOpenContext(isOpen: () => boolean): void {
    const contextKeys = injectOptional<ContextKeyService | null>(CONTEXT_KEY_SERVICE, null);

    $effect(() => {
        if (!contextKeys || !isOpen()) return;
        return retainDialogOpen(contextKeys);
    });
}
