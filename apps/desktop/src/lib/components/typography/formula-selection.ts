export interface FormulaSelectionLike {
    isCollapsed: boolean;
    rangeCount: number;
    getRangeAt(index: number): Pick<Range, 'intersectsNode'>;
}

export function isSelectionIntersectingNode(
    selection: FormulaSelectionLike | null,
    node: Node | null
): boolean {
    if (!selection || selection.isCollapsed || selection.rangeCount === 0 || !node) {
        return false;
    }

    for (let index = 0; index < selection.rangeCount; index += 1) {
        try {
            if (selection.getRangeAt(index).intersectsNode(node)) {
                return true;
            }
        } catch {
            continue;
        }
    }

    return false;
}
