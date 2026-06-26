import { describe, expect, it } from 'vitest';
import { MARKDOWN_RAW_TEXT_ATTRIBUTE, serializeMarkdownCopyFragment } from './markdown-copy';

type TestNode = {
    nodeType: number;
    tagName?: string;
    textContent?: string | null;
    childNodes?: TestNode[];
    getAttribute?: (name: string) => string | null;
};

function text(value: string): TestNode {
    return {
        nodeType: 3,
        textContent: value
    };
}

function element(children: TestNode[], markdownCopyText?: string): TestNode {
    return taggedElement('span', children, markdownCopyText);
}

function taggedElement(tagName: string, children: TestNode[], markdownCopyText?: string): TestNode {
    return {
        nodeType: 1,
        tagName,
        childNodes: children,
        textContent: children.map((child) => child.textContent ?? '').join(''),
        getAttribute(name: string) {
            if (name === MARKDOWN_RAW_TEXT_ATTRIBUTE && markdownCopyText !== undefined) {
                return markdownCopyText;
            }

            return null;
        }
    };
}

function br(): TestNode {
    return {
        nodeType: 1,
        tagName: 'br',
        childNodes: [],
        textContent: ''
    };
}

function fragment(children: TestNode[]): TestNode {
    return {
        nodeType: 11,
        childNodes: children,
        textContent: children.map((child) => child.textContent ?? '').join('')
    };
}

describe('serializeMarkdownCopyFragment', () => {
    it('returns null when the selected content has no markdown copy nodes', () => {
        const selected = fragment([text('plain text')]);

        expect(serializeMarkdownCopyFragment(selected as unknown as Node)).toBeNull();
    });

    it('replaces formula image nodes with their original markdown text', () => {
        const selected = fragment([
            text('before '),
            element([text('rendered formula')], '$a+b$'),
            text(' after')
        ]);

        expect(serializeMarkdownCopyFragment(selected as unknown as Node)).toBe(
            'before $a+b$ after'
        );
    });

    it('preserves paragraph breaks around formula nodes', () => {
        const selected = fragment([
            taggedElement('p', [text('first '), element([text('rendered formula')], '$x$')]),
            taggedElement('p', [text('second')])
        ]);

        expect(serializeMarkdownCopyFragment(selected as unknown as Node)).toBe(
            'first $x$\n\nsecond'
        );
    });

    it('preserves block breaks between headings and paragraphs', () => {
        const selected = fragment([
            taggedElement('h2', [text('Heading')]),
            taggedElement('p', [text('body '), element([text('rendered formula')], '$y$')])
        ]);

        expect(serializeMarkdownCopyFragment(selected as unknown as Node)).toBe(
            'Heading\n\nbody $y$'
        );
    });

    it('preserves line breaks between copied list items', () => {
        const selected = fragment([
            taggedElement('ul', [
                taggedElement('li', [text('first '), element([text('rendered formula')], '$x$')]),
                taggedElement('li', [text('second')])
            ])
        ]);

        expect(serializeMarkdownCopyFragment(selected as unknown as Node)).toBe(
            'first $x$\nsecond'
        );
    });

    it('preserves line breaks inside copied markdown fragments', () => {
        const selected = fragment([
            taggedElement('p', [
                text('first'),
                br(),
                text('second '),
                element([text('rendered formula')], '$z$')
            ])
        ]);

        expect(serializeMarkdownCopyFragment(selected as unknown as Node)).toBe(
            'first\nsecond $z$'
        );
    });
});
