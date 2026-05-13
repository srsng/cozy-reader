import type {
    MarkedOptions,
    Token,
    TokenizerAndRendererExtension,
    TokenizerExtension,
    Tokens
} from 'marked';
import { Lexer } from 'marked';

export interface MathToken extends Tokens.Generic {
    type: 'math';
    raw: string;
    text: string;
    displayMode: boolean;
}

export type MarkdownToken = Token | MathToken;

export function normalizeMarkdownLineEndings(content: string): string {
    return content.replace(/\r\n?/g, '\n');
}

function isFenceLine(line: string): boolean {
    return /^[ \t]{0,3}(`{3,}|~{3,})/.test(line);
}

function getFenceMarker(line: string): string | undefined {
    return line.match(/^[ \t]{0,3}(`{3,}|~{3,})/)?.[1];
}

function isClosingFenceLine(line: string, openingFenceMarker: string): boolean {
    const closingFenceMarker = getFenceMarker(line);

    return (
        closingFenceMarker !== undefined &&
        closingFenceMarker[0] === openingFenceMarker[0] &&
        closingFenceMarker.length >= openingFenceMarker.length
    );
}

function isStandaloneDollarBlockDelimiter(line: string): boolean {
    return /^[ \t]{0,3}\$\$[ \t]*$/.test(line);
}

function isTopLevelLine(line: string): boolean {
    return !/^[ \t]/.test(line);
}

function normalizeStandaloneDollarBlockSpacing(content: string): string {
    const lines = content.split('\n');
    const normalizedLines: string[] = [];
    let openingFenceMarker: string | undefined;
    let insideTopLevelDollarBlock = false;
    let justClosedTopLevelDollarBlock = false;

    for (const line of lines) {
        if (justClosedTopLevelDollarBlock) {
            if (line.trim()) {
                normalizedLines.push('');
            }
            justClosedTopLevelDollarBlock = false;
        }

        if (openingFenceMarker && isClosingFenceLine(line, openingFenceMarker)) {
            openingFenceMarker = undefined;
            normalizedLines.push(line);
            continue;
        }

        if (!openingFenceMarker && isFenceLine(line)) {
            openingFenceMarker = getFenceMarker(line);
            normalizedLines.push(line);
            continue;
        }

        if (!openingFenceMarker && isStandaloneDollarBlockDelimiter(line) && isTopLevelLine(line)) {
            if (
                !insideTopLevelDollarBlock &&
                normalizedLines.length > 0 &&
                normalizedLines[normalizedLines.length - 1].trim()
            ) {
                normalizedLines.push('');
            }

            normalizedLines.push(line);
            insideTopLevelDollarBlock = !insideTopLevelDollarBlock;
            justClosedTopLevelDollarBlock = !insideTopLevelDollarBlock;
            continue;
        }

        normalizedLines.push(line);
    }

    return normalizedLines.join('\n');
}

function isEscaped(src: string, index: number): boolean {
    let backslashCount = 0;

    for (let cursor = index - 1; cursor >= 0 && src[cursor] === '\\'; cursor -= 1) {
        backslashCount += 1;
    }

    return backslashCount % 2 === 1;
}

function findUnescapedDelimiter(src: string, delimiter: string, startIndex: number): number {
    let index = src.indexOf(delimiter, startIndex);

    while (index !== -1) {
        if (!isEscaped(src, index)) {
            return index;
        }

        index = src.indexOf(delimiter, index + 1);
    }

    return -1;
}

function isDigitCharacter(value: string | undefined): boolean {
    return value !== undefined && /\d/.test(value);
}

function firstNonWhitespaceCharacter(value: string): string | undefined {
    return value.trimStart()[0];
}

function normalizeMathText(text: string): string {
    return text.trim();
}

function createMathToken(raw: string, text: string, displayMode: boolean): MathToken {
    return {
        type: 'math',
        raw,
        text: normalizeMathText(text),
        displayMode
    };
}

function tokenizeDollarBlockMath(src: string): MathToken | undefined {
    const indentMatch = src.match(/^[ \t]{0,3}/);
    const indent = indentMatch?.[0] ?? '';

    if (!src.startsWith(`${indent}$$`)) {
        return undefined;
    }

    const contentStart = indent.length + 2;
    const closingIndex = findUnescapedDelimiter(src, '$$', contentStart);

    if (closingIndex === -1) {
        return undefined;
    }

    const afterClosing = closingIndex + 2;
    const trailingMatch = src.slice(afterClosing).match(/^[ \t]*(?:\n|$)/);

    if (!trailingMatch) {
        return undefined;
    }

    const raw = src.slice(0, afterClosing + trailingMatch[0].length);
    const text = src.slice(contentStart, closingIndex);

    return createMathToken(raw, text, true);
}

function tokenizeBracketBlockMath(src: string): MathToken | undefined {
    const indentMatch = src.match(/^[ \t]{0,3}/);
    const indent = indentMatch?.[0] ?? '';

    if (!src.startsWith(`${indent}\\[`)) {
        return undefined;
    }

    const contentStart = indent.length + 2;
    const closingIndex = findUnescapedDelimiter(src, '\\]', contentStart);

    if (closingIndex === -1) {
        return undefined;
    }

    const afterClosing = closingIndex + 2;
    const trailingMatch = src.slice(afterClosing).match(/^[ \t]*(?:\n|$)/);

    if (!trailingMatch) {
        return undefined;
    }

    const raw = src.slice(0, afterClosing + trailingMatch[0].length);
    const text = src.slice(contentStart, closingIndex);

    return createMathToken(raw, text, true);
}

function tokenizeInlineDollarMath(src: string): MathToken | undefined {
    if (!canOpenInlineDollar(src, 0)) {
        return undefined;
    }

    const closingIndex = findInlineDollarEnd(src, 0);

    if (closingIndex === -1) {
        return undefined;
    }

    const text = src.slice(1, closingIndex);

    if (!isValidInlineDollarMathText(text)) {
        return undefined;
    }

    return createMathToken(src.slice(0, closingIndex + 1), text, false);
}

function tokenizeInlineBracketMath(src: string): MathToken | undefined {
    if (!src.startsWith('\\(')) {
        return undefined;
    }

    const closingIndex = findUnescapedDelimiter(src, '\\)', 2);

    if (closingIndex === -1) {
        return undefined;
    }

    return createMathToken(src.slice(0, closingIndex + 2), src.slice(2, closingIndex), false);
}

function findInlineDollarStart(src: string): number {
    for (let index = 0; index < src.length; index += 1) {
        if (!canOpenInlineDollar(src, index)) {
            continue;
        }

        const closingIndex = findInlineDollarEnd(src, index);

        if (
            closingIndex !== -1 &&
            isValidInlineDollarMathText(src.slice(index + 1, closingIndex))
        ) {
            return index;
        }
    }

    return -1;
}

function canOpenInlineDollar(src: string, index: number): boolean {
    const nextCharacter = src[index + 1];

    return (
        src[index] === '$' &&
        !isEscaped(src, index) &&
        nextCharacter !== '$' &&
        nextCharacter !== undefined
    );
}

function canCloseInlineDollar(src: string, index: number): boolean {
    const nextCharacter = src[index + 1];

    return src[index] === '$' && !isEscaped(src, index) && !isDigitCharacter(nextCharacter);
}

function findInlineDollarEnd(src: string, startIndex: number): number {
    for (let index = startIndex + 1; index < src.length; index += 1) {
        if (src[index] === '\n') {
            return -1;
        }

        if (canCloseInlineDollar(src, index)) {
            return index;
        }
    }

    return -1;
}

function isValidInlineDollarMathText(text: string): boolean {
    if (!text.trim() || text.includes('\n')) {
        return false;
    }

    const firstContentCharacter = firstNonWhitespaceCharacter(text);

    if (!isDigitCharacter(firstContentCharacter)) {
        return true;
    }

    const trimmed = text.trim();
    const hasTrailingPadding = text.trimEnd() !== text;
    const hasMathSyntax = /[\\_^{}=+\-*/<>|]/.test(trimmed);
    const startsWithNumberThenWords = /^\d+(?:[.,]\d+)?\s+\S+/.test(trimmed);

    return !hasTrailingPadding && (!startsWithNumberThenWords || hasMathSyntax);
}

function findInlineBracketStart(src: string): number {
    let index = src.indexOf('\\(');

    while (index !== -1) {
        if (!isEscaped(src, index)) {
            return index;
        }

        index = src.indexOf('\\(', index + 2);
    }

    return -1;
}

export const mathExtensions: TokenizerAndRendererExtension[] = [
    {
        name: 'math-block',
        level: 'block',
        tokenizer(src) {
            return tokenizeDollarBlockMath(src) ?? tokenizeBracketBlockMath(src);
        }
    },
    {
        name: 'math-inline',
        level: 'inline',
        start(src) {
            const candidates = [findInlineDollarStart(src), findInlineBracketStart(src)].filter(
                (index) => index >= 0
            );

            return candidates.length > 0 ? Math.min(...candidates) : undefined;
        },
        tokenizer(src) {
            return tokenizeInlineDollarMath(src) ?? tokenizeInlineBracketMath(src);
        }
    }
];

function isTokenizerExtension(
    extension: TokenizerAndRendererExtension
): extension is TokenizerExtension {
    return 'tokenizer' in extension;
}

const tokenizerExtensions = mathExtensions.filter(isTokenizerExtension);
const blockExtensions = tokenizerExtensions.filter((extension) => extension.level === 'block');
const inlineExtensions = tokenizerExtensions.filter((extension) => extension.level === 'inline');

export const mathLexerExtensions: NonNullable<MarkedOptions['extensions']> = {
    renderers: {},
    childTokens: {},
    block: blockExtensions.map((extension) => extension.tokenizer),
    inline: inlineExtensions.map((extension) => extension.tokenizer),
    startBlock: blockExtensions.flatMap((extension) => (extension.start ? [extension.start] : [])),
    startInline: inlineExtensions.flatMap((extension) => (extension.start ? [extension.start] : []))
};

export const markdownLexerOptions: MarkedOptions = {
    async: false,
    breaks: true,
    gfm: true,
    pedantic: false,
    silent: false,
    extensions: mathLexerExtensions
};

export function lexMarkdown(content: string): MarkdownToken[] {
    const lexer = new Lexer(markdownLexerOptions);
    return lexer.lex(
        normalizeStandaloneDollarBlockSpacing(normalizeMarkdownLineEndings(content))
    ) as MarkdownToken[];
}
