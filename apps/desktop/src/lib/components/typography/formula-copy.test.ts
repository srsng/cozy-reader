import { describe, expect, it, vi } from 'vitest';
import { copyFormulaToClipboard, isFormulaCopyActivationKey } from './formula-copy';

describe('formula copy helpers', () => {
    it('treats Enter and Space as copy activation keys', () => {
        expect(isFormulaCopyActivationKey('Enter')).toBe(true);
        expect(isFormulaCopyActivationKey(' ')).toBe(true);
        expect(isFormulaCopyActivationKey('Spacebar')).toBe(true);
        expect(isFormulaCopyActivationKey('Escape')).toBe(false);
    });

    it('copies the formula text through the provided clipboard writer', async () => {
        const write = vi.fn().mockResolvedValue(true);

        const copied = await copyFormulaToClipboard('$a+b$', write);

        expect(copied).toBe(true);
        expect(write).toHaveBeenCalledWith('$a+b$', true);
    });
});
