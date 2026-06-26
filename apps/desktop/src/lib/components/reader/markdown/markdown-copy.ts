export const MARKDOWN_RAW_TEXT_ATTRIBUTE = 'data-markdown-raw-text';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

const BLOCK_TAG_NAMES = new Set([
    'address',
    'article',
    'aside',
    'blockquote',
    'dd',
    'div',
    'dl',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hr',
    'li',
    'main',
    'nav',
    'ol',
    'p',
    'pre',
    'section',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'ul'
]);

const SINGLE_LINE_BLOCK_TAG_NAMES = new Set(['li', 'tr', 'td', 'th']);

interface SerializedNode {
    text: string;
    hasMarkdownCopyText: boolean;
    isBlock: boolean;
    blockSeparator: '\n' | '\n\n';
}

function getMarkdownCopyText(node: Node): string | null {
    const maybeElement = node as Node & {
        getAttribute?: (name: string) => string | null;
    };

    if (typeof maybeElement.getAttribute !== 'function') {
        return null;
    }

    return maybeElement.getAttribute(MARKDOWN_RAW_TEXT_ATTRIBUTE);
}

function getTagName(node: Node): string {
    const maybeElement = node as Node & {
        tagName?: string;
        nodeName?: string;
    };

    return (maybeElement.tagName ?? maybeElement.nodeName ?? '').toLowerCase();
}

function isElementNode(node: Node): boolean {
    return node.nodeType === ELEMENT_NODE;
}

function isBlockNode(node: Node): boolean {
    return isElementNode(node) && BLOCK_TAG_NAMES.has(getTagName(node));
}

function isSingleLineBlock(node: Node): boolean {
    return isElementNode(node) && SINGLE_LINE_BLOCK_TAG_NAMES.has(getTagName(node));
}

function getBlockSeparator(node: Node): '\n' | '\n\n' {
    return isSingleLineBlock(node) ? '\n' : '\n\n';
}

function appendWithBlockSeparator(output: string, child: SerializedNode): string {
    if (!child.text) {
        return output;
    }

    if (!output) {
        return child.text;
    }

    if (!child.isBlock) {
        return `${output}${child.text}`;
    }

    const separator = child.text.includes('\n') || output.endsWith('\n') ? '\n' : child.blockSeparator;
    return `${output.replace(/\n+$/, '')}${separator}${child.text.replace(/^\n+/, '')}`;
}

function serializeNode(node: Node): SerializedNode {
    const markdownCopyText = getMarkdownCopyText(node);
    const tagName = getTagName(node);

    if (markdownCopyText !== null) {
        return {
            text: markdownCopyText,
            hasMarkdownCopyText: true,
            isBlock: isBlockNode(node),
            blockSeparator: getBlockSeparator(node)
        };
    }

    if (isElementNode(node) && tagName === 'br') {
        return {
            text: '\n',
            hasMarkdownCopyText: false,
            isBlock: false,
            blockSeparator: '\n\n'
        };
    }

    if (node.nodeType === TEXT_NODE) {
        return {
            text: node.textContent ?? '',
            hasMarkdownCopyText: false,
            isBlock: false,
            blockSeparator: '\n\n'
        };
    }

    const children = Array.from(node.childNodes);

    if (!children.length) {
        return {
            text: node.textContent ?? '',
            hasMarkdownCopyText: false,
            isBlock: isBlockNode(node),
            blockSeparator: getBlockSeparator(node)
        };
    }

    const serializedChildren = children.map(serializeNode);
    const text = serializedChildren.reduce((output, child) => {
        if (child.isBlock && isSingleLineBlock(node)) {
            return appendWithBlockSeparator(output, { ...child, isBlock: false });
        }

        return appendWithBlockSeparator(output, child);
    }, '');

    return {
        text,
        hasMarkdownCopyText: serializedChildren.some((child) => child.hasMarkdownCopyText),
        isBlock: isBlockNode(node),
        blockSeparator: getBlockSeparator(node)
    };
}

export function serializeMarkdownCopyFragment(fragment: Node): string | null {
    const serialized = serializeNode(fragment);

    return serialized.hasMarkdownCopyText ? serialized.text : null;
}
