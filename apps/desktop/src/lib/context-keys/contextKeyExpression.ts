import type {
    ContextKeyInspection,
    ContextKeyPrimitiveValue,
    ContextKeySnapshot,
    ContextKeyValue
} from './types';

type ContextKeyArrayValue = readonly ContextKeyPrimitiveValue[];
type ContextKeyObjectValue = Record<string, ContextKeyPrimitiveValue>;

type LiteralValue = ContextKeyValue | ContextKeyArrayValue | ContextKeyObjectValue | RegExp;

type TokenType =
    | 'identifier'
    | 'literal'
    | 'operator'
    | 'leftParen'
    | 'rightParen'
    | 'leftBracket'
    | 'rightBracket'
    | 'regex'
    | 'comma'
    | 'eof';

type Token = {
    type: TokenType;
    value?: string | ContextKeyPrimitiveValue | RegExp;
};

type ExpressionNode =
    | { type: 'literal'; value: LiteralValue }
    | { type: 'key'; name: string }
    | { type: 'not'; expression: ExpressionNode }
    | { type: 'binary'; operator: BinaryOperator; left: ExpressionNode; right: ExpressionNode };

type BinaryOperator =
    | '||'
    | '&&'
    | '=='
    | '!='
    | '==='
    | '!=='
    | '=~'
    | '>'
    | '>='
    | '<'
    | '<='
    | 'in'
    | 'not in';

export class ContextKeyParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ContextKeyParseError';
    }
}

export function evaluateContextKeyExpression(
    expression: string,
    context: ContextKeySnapshot
): boolean {
    const inspection = inspectContextKeyExpression(expression, context);
    if (inspection.error) {
        console.warn(`Invalid context key expression "${expression}":`, inspection.error);
    }
    return inspection.matches;
}

export function inspectContextKeyExpression(
    expression: string | undefined,
    context: ContextKeySnapshot
): ContextKeyInspection {
    if (!expression || expression.trim() === '') {
        return {
            expression,
            matches: true,
            referencedKeys: [],
            snapshot: context
        };
    }

    try {
        const ast = new Parser(tokenize(expression)).parse();
        return {
            expression,
            matches: toBoolean(evaluateNode(ast, context)),
            referencedKeys: collectReferencedKeys(ast),
            snapshot: context
        };
    } catch (error) {
        return {
            expression,
            matches: false,
            referencedKeys: [],
            snapshot: context,
            error: error instanceof Error ? error : new Error(String(error))
        };
    }
}

function tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let index = 0;

    while (index < expression.length) {
        const char = expression[index];

        if (/\s/.test(char)) {
            index += 1;
            continue;
        }

        if (char === '(') {
            tokens.push({ type: 'leftParen' });
            index += 1;
            continue;
        }

        if (char === ')') {
            tokens.push({ type: 'rightParen' });
            index += 1;
            continue;
        }

        if (char === '[') {
            tokens.push({ type: 'leftBracket' });
            index += 1;
            continue;
        }

        if (char === ']') {
            tokens.push({ type: 'rightBracket' });
            index += 1;
            continue;
        }

        if (char === ',') {
            tokens.push({ type: 'comma' });
            index += 1;
            continue;
        }

        const threeCharOperator = expression.slice(index, index + 3);
        if (threeCharOperator === '===' || threeCharOperator === '!==') {
            tokens.push({ type: 'operator', value: threeCharOperator });
            index += 3;
            continue;
        }

        const twoCharOperator = expression.slice(index, index + 2);
        if (
            twoCharOperator === '&&' ||
            twoCharOperator === '||' ||
            twoCharOperator === '==' ||
            twoCharOperator === '!=' ||
            twoCharOperator === '>=' ||
            twoCharOperator === '<=' ||
            twoCharOperator === '=~'
        ) {
            tokens.push({ type: 'operator', value: twoCharOperator });
            index += 2;
            continue;
        }

        if (char === '!' || char === '>' || char === '<') {
            tokens.push({ type: 'operator', value: char });
            index += 1;
            continue;
        }

        if (char === '"' || char === "'") {
            const result = readString(expression, index);
            tokens.push({ type: 'literal', value: result.value });
            index = result.nextIndex;
            continue;
        }

        if (char === '/') {
            const result = readRegex(expression, index);
            tokens.push({ type: 'regex', value: result.value });
            index = result.nextIndex;
            continue;
        }

        if (isNumberStart(expression, index)) {
            const result = readNumber(expression, index);
            tokens.push({ type: 'literal', value: result.value });
            index = result.nextIndex;
            continue;
        }

        if (isIdentifierStart(char)) {
            const result = readIdentifier(expression, index);
            const identifier = result.value;
            if (
                identifier === 'true' ||
                identifier === 'false' ||
                identifier === 'null' ||
                identifier === 'undefined'
            ) {
                tokens.push({ type: 'literal', value: parseKeywordLiteral(identifier) });
            } else if (identifier === 'in' || identifier === 'not') {
                tokens.push({ type: 'operator', value: identifier });
            } else {
                tokens.push({ type: 'identifier', value: identifier });
            }
            index = result.nextIndex;
            continue;
        }

        throw new ContextKeyParseError(`Unexpected character "${char}" at ${index}`);
    }

    tokens.push({ type: 'eof' });
    return tokens;
}

class Parser {
    private index = 0;

    constructor(private readonly tokens: Token[]) {}

    parse(): ExpressionNode {
        const expression = this.parseOr();
        this.expect('eof');
        return expression;
    }

    private parseOr(): ExpressionNode {
        let expression = this.parseAnd();

        while (this.matchOperator('||')) {
            expression = {
                type: 'binary',
                operator: '||',
                left: expression,
                right: this.parseAnd()
            };
        }

        return expression;
    }

    private parseAnd(): ExpressionNode {
        let expression = this.parseComparison();

        while (this.matchOperator('&&')) {
            expression = {
                type: 'binary',
                operator: '&&',
                left: expression,
                right: this.parseComparison()
            };
        }

        return expression;
    }

    private parseComparison(): ExpressionNode {
        let expression = this.parseUnary();
        const operator = this.matchComparisonOperator();

        if (!operator) return expression;

        return {
            type: 'binary',
            operator,
            left: expression,
            right: this.parseComparisonRight(operator)
        };
    }

    private parseComparisonRight(operator: BinaryOperator): ExpressionNode {
        const token = this.current();

        if (isEqualityOperator(operator) && token.type === 'identifier') {
            this.index += 1;
            return { type: 'literal', value: token.value as string };
        }

        if (operator === '=~') {
            if (!this.match('regex')) {
                throw new ContextKeyParseError('Expected regular expression literal after =~');
            }
            return { type: 'literal', value: token.value as RegExp };
        }

        return this.parseUnary();
    }

    private parseUnary(): ExpressionNode {
        if (this.matchOperator('!')) {
            return {
                type: 'not',
                expression: this.parseUnary()
            };
        }

        return this.parsePrimary();
    }

    private parsePrimary(): ExpressionNode {
        const token = this.current();

        if (this.match('leftParen')) {
            const expression = this.parseOr();
            this.expect('rightParen');
            return expression;
        }

        if (this.match('leftBracket')) {
            const values: ContextKeyPrimitiveValue[] = [];
            if (!this.match('rightBracket')) {
                do {
                    const item = this.parsePrimary();
                    if (item.type !== 'literal' || !isPrimitiveValue(item.value)) {
                        throw new ContextKeyParseError('Array values must be primitive literals');
                    }
                    values.push(item.value);
                } while (this.match('comma'));
                this.expect('rightBracket');
            }
            return { type: 'literal', value: values };
        }

        if (this.match('literal')) {
            return { type: 'literal', value: token.value as ContextKeyPrimitiveValue };
        }

        if (this.match('regex')) {
            return { type: 'literal', value: token.value as RegExp };
        }

        if (this.match('identifier')) {
            return { type: 'key', name: token.value as string };
        }

        throw new ContextKeyParseError(`Unexpected token ${token.type}`);
    }

    private matchComparisonOperator(): BinaryOperator | undefined {
        const token = this.current();
        if (token.type !== 'operator') return undefined;

        if (
            token.value === '==' ||
            token.value === '!=' ||
            token.value === '===' ||
            token.value === '!==' ||
            token.value === '=~' ||
            token.value === '>' ||
            token.value === '>=' ||
            token.value === '<' ||
            token.value === '<=' ||
            token.value === 'in'
        ) {
            this.index += 1;
            return token.value;
        }

        if (token.value === 'not' && this.peek().type === 'operator' && this.peek().value === 'in') {
            this.index += 2;
            return 'not in';
        }

        return undefined;
    }

    private match(type: TokenType): boolean {
        if (this.current().type !== type) return false;
        this.index += 1;
        return true;
    }

    private matchOperator(value: string): boolean {
        const token = this.current();
        if (token.type !== 'operator' || token.value !== value) return false;
        this.index += 1;
        return true;
    }

    private expect(type: TokenType): Token {
        const token = this.current();
        if (token.type !== type) {
            throw new ContextKeyParseError(`Expected ${type}, got ${token.type}`);
        }
        this.index += 1;
        return token;
    }

    private current(): Token {
        return this.tokens[this.index];
    }

    private peek(): Token {
        return this.tokens[this.index + 1] ?? { type: 'eof' };
    }
}

function evaluateNode(node: ExpressionNode, context: ContextKeySnapshot): LiteralValue {
    switch (node.type) {
        case 'literal':
            return node.value;
        case 'key':
            return context[node.name];
        case 'not':
            return !toBoolean(evaluateNode(node.expression, context));
        case 'binary':
            return evaluateBinary(node.operator, evaluateNode(node.left, context), node.right, context);
    }
}

function evaluateBinary(
    operator: BinaryOperator,
    left: LiteralValue,
    rightNode: ExpressionNode,
    context: ContextKeySnapshot
): boolean {
    if (operator === '||') {
        return toBoolean(left) || toBoolean(evaluateNode(rightNode, context));
    }

    if (operator === '&&') {
        return toBoolean(left) && toBoolean(evaluateNode(rightNode, context));
    }

    const right = evaluateNode(rightNode, context);

    switch (operator) {
        case '==':
        case '===':
            return left === right;
        case '!=':
        case '!==':
            return left !== right;
        case '=~':
            return matchRegex(left, right);
        case '>':
        case '>=':
        case '<':
        case '<=':
            return compareNumbers(operator, left, right);
        case 'in':
            return containsContextValue(right, left);
        case 'not in':
            return !containsContextValue(right, left);
        default:
            return false;
    }
}

function collectReferencedKeys(node: ExpressionNode, keys = new Set<string>()): readonly string[] {
    switch (node.type) {
        case 'key':
            keys.add(node.name);
            break;
        case 'not':
            collectReferencedKeys(node.expression, keys);
            break;
        case 'binary':
            collectReferencedKeys(node.left, keys);
            collectReferencedKeys(node.right, keys);
            break;
    }

    return Array.from(keys);
}

function containsContextValue(container: LiteralValue, value: LiteralValue): boolean {
    if (!isPrimitiveValue(value)) return false;

    if (Array.isArray(container)) {
        return container.includes(value);
    }

    if (isContextObjectValue(container)) {
        return Object.prototype.hasOwnProperty.call(container, String(value));
    }

    return false;
}

function compareNumbers(operator: BinaryOperator, left: LiteralValue, right: LiteralValue): boolean {
    if (typeof left !== 'number' || typeof right !== 'number') return false;

    switch (operator) {
        case '>':
            return left > right;
        case '>=':
            return left >= right;
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        default:
            return false;
    }
}

function matchRegex(left: LiteralValue, right: LiteralValue): boolean {
    if (typeof left !== 'string' || !(right instanceof RegExp)) return false;
    right.lastIndex = 0;
    return right.test(left);
}

function toBoolean(value: LiteralValue): boolean {
    return Boolean(value);
}

function readString(expression: string, startIndex: number): { value: string; nextIndex: number } {
    const quote = expression[startIndex];
    let value = '';
    let index = startIndex + 1;

    while (index < expression.length) {
        const char = expression[index];
        if (char === quote) {
            return { value, nextIndex: index + 1 };
        }

        if (char === '\\') {
            const nextChar = expression[index + 1];
            if (nextChar === undefined) {
                throw new ContextKeyParseError('Unterminated escape sequence');
            }
            value += nextChar;
            index += 2;
            continue;
        }

        value += char;
        index += 1;
    }

    throw new ContextKeyParseError('Unterminated string literal');
}

function readNumber(expression: string, startIndex: number): { value: number; nextIndex: number } {
    let index = startIndex;
    let rawValue = '';

    if (expression[index] === '-') {
        rawValue += '-';
        index += 1;
    }

    while (index < expression.length && /[0-9]/.test(expression[index])) {
        rawValue += expression[index];
        index += 1;
    }

    if (expression[index] === '.') {
        rawValue += '.';
        index += 1;
        while (index < expression.length && /[0-9]/.test(expression[index])) {
            rawValue += expression[index];
            index += 1;
        }
    }

    const value = Number(rawValue);
    if (Number.isNaN(value)) {
        throw new ContextKeyParseError(`Invalid number literal "${rawValue}"`);
    }

    return { value, nextIndex: index };
}

function readRegex(expression: string, startIndex: number): { value: RegExp; nextIndex: number } {
    let index = startIndex + 1;
    let pattern = '';
    let inCharacterClass = false;

    while (index < expression.length) {
        const char = expression[index];

        if (char === '\\') {
            const nextChar = expression[index + 1];
            if (nextChar === undefined) {
                throw new ContextKeyParseError('Unterminated regular expression literal');
            }
            pattern += char + nextChar;
            index += 2;
            continue;
        }

        if (char === '[') {
            inCharacterClass = true;
            pattern += char;
            index += 1;
            continue;
        }

        if (char === ']') {
            inCharacterClass = false;
            pattern += char;
            index += 1;
            continue;
        }

        if (char === '/' && !inCharacterClass) {
            index += 1;
            let flags = '';
            while (index < expression.length && /[A-Za-z]/.test(expression[index])) {
                flags += expression[index];
                index += 1;
            }
            return { value: new RegExp(pattern, flags), nextIndex: index };
        }

        pattern += char;
        index += 1;
    }

    throw new ContextKeyParseError('Unterminated regular expression literal');
}

function readIdentifier(
    expression: string,
    startIndex: number
): { value: string; nextIndex: number } {
    let index = startIndex;
    let value = '';

    while (index < expression.length && isIdentifierPart(expression[index])) {
        value += expression[index];
        index += 1;
    }

    return { value, nextIndex: index };
}

function parseKeywordLiteral(value: string): ContextKeyPrimitiveValue {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    return undefined;
}

function isPrimitiveValue(value: LiteralValue): value is ContextKeyPrimitiveValue {
    return value === null || value === undefined || ['boolean', 'number', 'string'].includes(typeof value);
}

function isContextObjectValue(value: LiteralValue): value is ContextKeyObjectValue {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof RegExp);
}

function isEqualityOperator(operator: BinaryOperator): boolean {
    return operator === '==' || operator === '!=' || operator === '===' || operator === '!==';
}

function isNumberStart(expression: string, index: number): boolean {
    return /[0-9]/.test(expression[index]) || (expression[index] === '-' && /[0-9]/.test(expression[index + 1]));
}

function isIdentifierStart(char: string): boolean {
    return /[A-Za-z_.]/.test(char);
}

function isIdentifierPart(char: string): boolean {
    return /[A-Za-z0-9_.-]/.test(char);
}
