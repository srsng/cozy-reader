import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { MARKDOWN_RAW_TEXT_ATTRIBUTE } from './markdown-copy';
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

        expect(body).toContain('代码块');
        expect(body).toContain('ts');
        expect(body).toContain('<pre');
        expect(body).toContain('<code');
        expect(body).toContain('language-ts');
        expect(body).toContain('const answer = 42;');
    });

    it('renders fenced code blocks with line numbers and a copy button', () => {
        const { body } = renderMarkdown('```ts\nconst a = 1;\nconst b = 2;\n```');
        const normalizedBody = withoutSvelteCommentsAndWhitespace(body);

        expect(body).toContain('aria-label="复制代码"');
        expect(body).toContain('data-code-copy-button');
        expect(body).toContain('data-code-line-number');
        expect(normalizedBody).toMatch(/data-code-line-number[^>]*> ?1 ?<\/span>/);
        expect(normalizedBody).toMatch(/data-code-line-number[^>]*> ?2 ?<\/span>/);
        expect(body).toContain('const a = 1;');
        expect(body).toContain('const b = 2;');
    });

    it('renders unordered and ordered lists with visible marker styles', () => {
        const { body } = renderMarkdown('- item\n\n1. first');

        expect(body).toContain('<ul');
        expect(body).toContain('list-disc');
        expect(body).toContain('<ol');
        expect(body).toContain('list-decimal');
        expect(body).toContain('text-[1em]');
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

    it('renders horizontal rules without leaking the raw marker text', () => {
        const { body } = renderMarkdown('###### H6 标题\n\n---\n');
        const normalizedBody = withoutSvelteCommentsAndWhitespace(body);

        expect(body).toContain('data-slot="separator"');
        expect(body).toContain('data-orientation="horizontal"');
        expect(normalizedBody).not.toContain('---');
    });

    it('wraps html tokens in a labeled block container', () => {
        const { body } = renderMarkdown('<div class="note">hello</div>');

        expect(body).toContain('data-html-block="true"');
        expect(body).toContain('HTML');
        expect(body).toContain('查看源码');
        expect(body).toContain('aria-label="切换到 HTML 源码视图"');
        expect(body).toContain('aria-pressed="false"');
        expect(body).toContain('class="note"');
        expect(body).toContain('hello');
        expect(body).not.toContain('查看预览');
    });

    it('renders math formulas with original markdown copy text', () => {
        const { body } = renderMarkdown('Before $a+b$ after.');

        expect(body).toContain('<canvas');
        expect(body).toContain('data-markdown-copy-text="$a+b$"');
    });

    it('renders links with copy metadata without leaking token internals as anchor attributes', () => {
        const { body } = renderMarkdown('[Visible](https://example.com "Official")');

        expect(body).toContain('href="https://example.com"');
        expect(body).toContain('title="Official"');
        expect(body).toContain('Visible');
        expect(body).toContain(
            `${MARKDOWN_RAW_TEXT_ATTRIBUTE}="[Visible](https://example.com &quot;Official&quot;)"`
        );
        expect(body).not.toContain('D:\\books\\README.md');
        expect(body).not.toContain('raw=');
        expect(body).not.toContain(' text="');
        expect(body).not.toContain('data-text=');
        expect(body).not.toContain('tokens=');
        expect(body).not.toContain('mdSrcPath');
        expect(body).not.toContain('mdsrcpath');
    });
});
