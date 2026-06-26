import type { KeybindingManager } from './keybindingManager';

export function attachIframeKeybindingBridge(
    doc: Document,
    keybindingManager: Pick<KeybindingManager, 'dispatchKeyboardEvent'>
): () => void {
    const handleKeydown = (event: KeyboardEvent) => {
        keybindingManager.dispatchKeyboardEvent(event);
    };

    doc.addEventListener('keydown', handleKeydown, true);

    return () => {
        doc.removeEventListener('keydown', handleKeydown, true);
    };
}
