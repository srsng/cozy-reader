import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Formula from './formula.svelte';
import { MARKDOWN_RAW_TEXT_ATTRIBUTE } from '$components/reader/markdown/markdown-copy';

function renderFormula(displayMode: boolean) {
    return render(Formula, {
        props: {
            raw: '$a+b$',
            text: 'a+b',
            displayMode
        }
    });
}

describe('Formula rendering', () => {
    it('renders inline formulas with shared copy metadata', () => {
        const { body } = renderFormula(false);

        expect(body).toContain('role="button"');
        expect(body).toContain('tabindex="0"');
        expect(body).toContain('aria-label="复制公式：a+b"');
        expect(body).toContain(`${MARKDOWN_RAW_TEXT_ATTRIBUTE}="$a+b$"`);
        expect(body).toContain('aria-hidden="true"');
        expect(body).toContain('inline-block align-middle');
    });

    it('renders block formulas with the same shared copy metadata', () => {
        const { body } = renderFormula(true);

        expect(body).toContain('role="button"');
        expect(body).toContain('tabindex="0"');
        expect(body).toContain('aria-label="复制公式：a+b"');
        expect(body).toContain(`${MARKDOWN_RAW_TEXT_ATTRIBUTE}="$a+b$"`);
        expect(body).toContain('aria-hidden="true"');
        expect(body).toContain('mx-auto inline-block max-w-full align-middle');
    });
});
