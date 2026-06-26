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
        expect(body).not.toContain('decoration-primary/40');
        expect(body).not.toContain('<span class="min-w-0 break-words">');
    });
});
