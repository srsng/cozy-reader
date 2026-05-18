import { KeybindingUtils } from './keybindingListener';
import { ModifierKey, type KeyCombination } from './types';

const blockedBrowserShortcuts: KeyCombination[] = [
    { key: 'j', modifiers: [ModifierKey.Ctrl] },
    { key: 'p', modifiers: [ModifierKey.Ctrl] },
    { key: 'r', modifiers: [ModifierKey.Ctrl] },
    { key: 'f5', modifiers: [] }
];

export function isBlockedBrowserShortcut(combination: KeyCombination): boolean {
    return blockedBrowserShortcuts.some((blockedCombination) =>
        KeybindingUtils.combinationsEqual(blockedCombination, combination)
    );
}
