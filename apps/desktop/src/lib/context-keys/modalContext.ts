import { ContextKey, type ContextKeyService } from '$lib/context-keys';

const openModalCounts = new WeakMap<ContextKeyService, number>();

export function retainDialogOpen(contextKeys: ContextKeyService): () => void {
    const nextCount = (openModalCounts.get(contextKeys) ?? 0) + 1;
    openModalCounts.set(contextKeys, nextCount);
    contextKeys.set(ContextKey.DialogOpen, true);

    return () => {
        const currentCount = openModalCounts.get(contextKeys) ?? 0;
        const remainingCount = Math.max(0, currentCount - 1);

        if (remainingCount === 0) {
            openModalCounts.delete(contextKeys);
        } else {
            openModalCounts.set(contextKeys, remainingCount);
        }

        contextKeys.set(ContextKey.DialogOpen, remainingCount > 0);
    };
}
