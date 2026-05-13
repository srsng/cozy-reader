import { describe, expect, it } from 'vitest';
import { normalizeRatexLatex } from './formula-utils';

describe('normalizeRatexLatex', () => {
    it('converts simple align environments to gather without alignment markers', () => {
        expect(normalizeRatexLatex('\\begin{align}\na&=b\\\\\nc&=d\n\\end{align}')).toBe(
            '\\begin{gather*}\na=b\\\\\nc=d\n\\end{gather*}'
        );
    });

    it('preserves escaped ampersands when converting align environments', () => {
        expect(normalizeRatexLatex('\\begin{align}\na\\&b&=c\n\\end{align}')).toBe(
            '\\begin{gather*}\na\\&b=c\n\\end{gather*}'
        );
    });

    it('leaves alignat environments unchanged instead of dropping required arguments', () => {
        const latex = '\\begin{alignat}{2}\na&=b&c&=d\n\\end{alignat}';

        expect(normalizeRatexLatex(latex)).toBe(latex);
    });

    it('leaves alignedat environments unchanged instead of dropping required arguments', () => {
        const latex = '\\begin{alignedat}{2}\na&=b&c&=d\n\\end{alignedat}';

        expect(normalizeRatexLatex(latex)).toBe(latex);
    });

    it('leaves nested matrix ampersands unchanged', () => {
        const latex = '\\begin{align}\nA&=\\begin{matrix}1&2\\\\3&4\\end{matrix}\n\\end{align}';

        expect(normalizeRatexLatex(latex)).toBe(
            '\\begin{gather*}\nA=\\begin{matrix}1&2\\\\3&4\\end{matrix}\n\\end{gather*}'
        );
    });

    it('leaves nested cases ampersands unchanged', () => {
        const latex =
            '\\begin{align}\nf(x)&=\\begin{cases}x&x>0\\\\0&x=0\\end{cases}\n\\end{align}';

        expect(normalizeRatexLatex(latex)).toBe(
            '\\begin{gather*}\nf(x)=\\begin{cases}x&x>0\\\\0&x=0\\end{cases}\n\\end{gather*}'
        );
    });
});
