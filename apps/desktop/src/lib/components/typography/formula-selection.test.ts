import { describe, expect, it } from 'vitest';
import { isSelectionIntersectingNode, type FormulaSelectionLike } from './formula-selection';

function makeSelection(
    overrides: Partial<FormulaSelectionLike>,
    ranges: Array<{ intersectsNode: (node: Node) => boolean }> = []
): FormulaSelectionLike {
    return {
        isCollapsed: false,
        rangeCount: ranges.length,
        getRangeAt(index: number) {
            return ranges[index] as Range;
        },
        ...overrides
    };
}

describe('isSelectionIntersectingNode', () => {
    it('returns false when selection is collapsed', () => {
        const selection = makeSelection({ isCollapsed: true });

        expect(isSelectionIntersectingNode(selection, {} as Node)).toBe(false);
    });

    it('returns true when any range intersects the node', () => {
        const selection = makeSelection({}, [
            { intersectsNode: () => false },
            { intersectsNode: () => true }
        ]);

        expect(isSelectionIntersectingNode(selection, {} as Node)).toBe(true);
    });

    it('returns false when no range intersects the node', () => {
        const selection = makeSelection({}, [{ intersectsNode: () => false }]);

        expect(isSelectionIntersectingNode(selection, {} as Node)).toBe(false);
    });
});
