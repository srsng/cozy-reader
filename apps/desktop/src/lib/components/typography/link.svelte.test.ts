import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Link from './link.svelte';

describe('Typography link', () => {
    it('renders as a selectable inline anchor', () => {
        const { body } = render(Link, {
            props: {
                href: 'https://openai.com',
                children: createRawSnippet(() => ({
                    render: () => 'OpenAI'
                }))
            }
        });

        expect(body).toContain('<a href="https://openai.com"');
        expect(body).toContain('OpenAI');
        expect(body).not.toContain('<button');
        expect(body).not.toContain('select-none');
        expect(body).not.toContain('inline-flex');
        expect(body).toContain('text-primary');
        expect(body).toContain('underline-offset-4');
        expect(body).toContain('hover:underline');
        expect(body).toContain('text-muted-foreground');
        expect(body).toContain('size-3');
        expect(body).toContain('align-[0.1em]');
        expect(body).not.toContain('text-secondary');
        expect(body).not.toContain('after:');
        expect(body).not.toContain('align-text-bottom');
        expect(body).not.toContain('align-middle');
        expect(body).not.toContain('<span class="relative inline');
        expect(body).not.toContain('<span class="min-w-0 break-words">');
    });
});
