import { describe, expect, it, vi } from 'vitest';
import { attachIframeKeybindingBridge } from './iframeKeybindingBridge';

function createKeyboardEvent(key: string): KeyboardEvent {
    return {
        key,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false
    } as KeyboardEvent;
}

describe('attachIframeKeybindingBridge', () => {
    it('forwards iframe keydown events to the keybinding manager and cleans up', () => {
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        let keydownListener: ((event: KeyboardEvent) => void) | undefined;

        addEventListener.mockImplementation((_type, listener) => {
            keydownListener = listener;
        });

        const doc = {
            addEventListener,
            removeEventListener
        } as unknown as Document;
        const dispatchKeyboardEvent = vi.fn();

        const dispose = attachIframeKeybindingBridge(doc, { dispatchKeyboardEvent });
        const event = createKeyboardEvent('ArrowLeft');

        keydownListener?.(event);
        dispose();

        expect(addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true);
        expect(dispatchKeyboardEvent).toHaveBeenCalledWith(event);
        expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true);
    });
});
