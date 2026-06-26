import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Markdown from './Markdown.svelte';

function withoutSvelteComments(html: string): string {
    return html.replace(/<!--.*?-->/g, '');
}

function withoutSvelteCommentsAndWhitespace(html: string): string {
    return withoutSvelteComments(html).replace(/\s+/g, ' ');
}

function renderMarkdown(content: string) {
    return render(Markdown, {
        props: {
            content,
            filePath: 'D:\\books\\README.md'
        }
    });
}

describe('Markdown rendering', () => {
    it('renders fenced code blocks as pre/code markup', () => {
        const { body } = renderMarkdown('```ts\nconst answer = 42;\n```');

        expect(body).toContain('<pre');
        expect(body).toContain('<code');
        expect(body).toContain('language-ts');
        expect(body).toContain('const answer = 42;');
    });

    it('renders strikethrough text with a del element', () => {
        const { body } = renderMarkdown('This is ~~removed~~ text.');

        expect(body).toContain('<del>');
        expect(body).toContain('removed');
    });

    it('renders task list items with a checkbox', () => {
        const { body } = renderMarkdown('- [x] done');

        expect(body).toContain('<input');
        expect(body).toContain('type="checkbox"');
        expect(body).toContain('checked');
        expect(body).toContain('disabled');
        expect(body).toContain('done');
    });

    it('renders markdown tables with header and cell content', () => {
        const { body } = renderMarkdown('| Name | Value |\n| --- | ---: |\n| **A** | B |\n');

        expect(body).toContain('<table');
        expect(body).toContain('<th');
        expect(body).toContain('<td');
        expect(withoutSvelteCommentsAndWhitespace(body)).toMatch(/<strong[^>]*>.*A.*<\/strong>/);
        expect(body).toContain('B');
    });

    it('does not render markdown link token internals as anchor attributes', () => {
        const { body } = renderMarkdown('[Visible](https://example.com "Official")');

        expect(body).toContain('href="https://example.com"');
        expect(body).toContain('title="Official"');
        expect(body).toContain('Visible');
        expect(body).not.toContain('D:\\books\\README.md');
        expect(body).not.toContain('[Visible](https://example.com &quot;Official&quot;)');
        expect(body).not.toContain('raw=');
        expect(body).not.toContain('text=');
        expect(body).not.toContain('tokens=');
        expect(body).not.toContain('mdSrcPath');
        expect(body).not.toContain('mdsrcpath');
    });
});
