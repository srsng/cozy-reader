import { describe, expect, it } from 'vitest';
import type { Tokens } from 'marked';
import { lexMarkdown, type MarkdownToken, type MathToken } from './math';

function getParagraphTokens(tokens: MarkdownToken[]): MarkdownToken[] {
    const paragraph = tokens.find((token): token is Tokens.Paragraph => token.type === 'paragraph');
    return (paragraph?.tokens ?? []) as MarkdownToken[];
}

function getFirstListItem(tokens: MarkdownToken[]): Tokens.ListItem | undefined {
    const list = tokens.find((token): token is Tokens.List => token.type === 'list');
    return list?.items[0];
}

describe('lexMarkdown', () => {
    it('keeps dollar block math inside list items', () => {
        const tokens = lexMarkdown('1. item\n   $$\na=1\\\\b=2\n   $$\n');
        const item = getFirstListItem(tokens);

        expect(tokens).toHaveLength(1);
        expect(tokens[0].type).toBe('list');
        expect(item?.tokens.map((token) => token.type)).toEqual(['text', 'math']);
        expect((item?.tokens[1] as MathToken | undefined)?.displayMode).toBe(true);
        expect((item?.tokens[1] as MathToken | undefined)?.text).toBe('a=1\\\\b=2');
    });

    it('does not extract dollar blocks from fenced code', () => {
        const tokens = lexMarkdown('```md\n$$\na=1\n$$\n```\n');

        expect(tokens).toHaveLength(1);
        expect(tokens[0].type).toBe('code');
        expect((tokens[0] as Tokens.Code).text).toBe('$$\na=1\n$$');
    });

    it('uses matching fence markers before normalizing dollar block spacing', () => {
        const tokens = lexMarkdown('~~~md\n```\n$$\na=1\n$$\n```\n~~~\n');

        expect(tokens).toHaveLength(1);
        expect(tokens[0].type).toBe('code');
        expect((tokens[0] as Tokens.Code).text).toBe('```\n$$\na=1\n$$\n```');
    });

    it('tokenizes standalone dollar blocks adjacent to prose without breaking code fences', () => {
        const tokens = lexMarkdown(
            '对于该问题，可以转化为一个关于可调参数 $ \\theta $ 的问题\n$$\n\\begin{align*}\n\n\\min_{\\theta \\in R^n}&=0\\\\\n\n\\end{align*}\n$$\n其中，$ n = 256, m = 2000$ ，为提供的数据集的数据的维度与组数。'
        );

        const mathToken = tokens.find((token): token is MathToken => token.type === 'math');

        expect(tokens.map((token) => token.type).filter((type) => type !== 'space')).toEqual([
            'paragraph',
            'math',
            'paragraph'
        ]);
        expect(mathToken?.displayMode).toBe(true);
        expect(mathToken?.text).toContain('\\begin{align*}');

        const lastParagraph = tokens.findLast(
            (token): token is Tokens.Paragraph => token.type === 'paragraph'
        );
        const inlineTokens = (lastParagraph?.tokens ?? []) as MarkdownToken[];
        expect(inlineTokens.map((token) => token.type)).toEqual(['text', 'math', 'text']);
        expect((inlineTokens[1] as MathToken).text).toBe('n = 256, m = 2000');
    });

    it('does not tokenize paired currency values as inline math', () => {
        const inlineTokens = getParagraphTokens(lexMarkdown('Price is $5 and $10 today.'));

        expect(inlineTokens).toHaveLength(1);
        expect(inlineTokens[0].type).toBe('text');
        expect((inlineTokens[0] as Tokens.Text).text).toBe('Price is $5 and $10 today.');
    });

    it('skips currency-like dollars before later inline math', () => {
        const inlineTokens = getParagraphTokens(lexMarkdown('Price is $5 and formula $x=10$.'));
        const text = inlineTokens
            .filter((token): token is Tokens.Text => token.type === 'text')
            .map((token) => token.text)
            .join('');
        const mathTokens = inlineTokens.filter(
            (token): token is MathToken => token.type === 'math'
        );

        expect(text).toContain('Price is $5 and formula ');
        expect(mathTokens).toHaveLength(1);
        expect(mathTokens[0].text).toBe('x=10');
    });

    it('still tokenizes regular inline dollar math', () => {
        const inlineTokens = getParagraphTokens(lexMarkdown('Inline $a+b$ text.'));

        expect(inlineTokens.map((token) => token.type)).toEqual(['text', 'math', 'text']);
        expect((inlineTokens[1] as MathToken).text).toBe('a+b');
        expect((inlineTokens[1] as MathToken).displayMode).toBe(false);
    });

    it('tokenizes inline dollar math with inner padding', () => {
        const inlineTokens = getParagraphTokens(lexMarkdown('Value is $ \\theta $ today.'));

        expect(inlineTokens.map((token) => token.type)).toEqual(['text', 'math', 'text']);
        expect((inlineTokens[1] as MathToken).text).toBe('\\theta');
    });

    it('ignores escaped inline dollar delimiters', () => {
        const inlineTokens = getParagraphTokens(lexMarkdown('Inline \\$a+b$ text.'));

        expect(inlineTokens.some((token) => token.type === 'math')).toBe(false);
    });
});
