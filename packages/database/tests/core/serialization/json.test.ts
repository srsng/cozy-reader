import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { isValidJSON, serializeJSON, deserializeJSON } from '../../../src/core/serialization/json';

describe('json', () => {
    describe('isValidJSON', () => {
        it('应该返回 true 对于有效的 JSON 字符串', () => {
            expect(isValidJSON('{"key": "value"}')).toBe(true);
            expect(isValidJSON('[1, 2, 3]')).toBe(true);
            expect(isValidJSON('"string"')).toBe(true);
            expect(isValidJSON('123')).toBe(true);
            expect(isValidJSON('true')).toBe(true);
            expect(isValidJSON('null')).toBe(true);
        });

        it('应该返回 false 对于无效的 JSON 字符串', () => {
            expect(isValidJSON('{key: value}')).toBe(false);
            expect(isValidJSON('[1, 2,')).toBe(false);
            expect(isValidJSON('not json')).toBe(false);
        });

        it('应该返回 false 对于空字符串', () => {
            expect(isValidJSON('')).toBe(false);
        });

        it('应该返回 false 对于非字符串类型', () => {
            // 注意：JSON.parse 的行为
            // - JSON.parse(null) 返回 null，不会抛出错误
            // - JSON.parse(undefined) 抛出错误
            // - JSON.parse(123) 返回 123，不会抛出错误（数字被转换为字符串）

            // @ts-expect-error - 测试非字符串输入
            expect(isValidJSON(null)).toBe(false); // JSON.parse(null) 返回 null，不抛出错误
            // @ts-expect-error - 测试非字符串输入
            expect(isValidJSON(undefined)).toBe(false); // JSON.parse(undefined) 抛出错误
            // @ts-expect-error - 测试非字符串输入
            expect(isValidJSON(123)).toBe(false); // JSON.parse(123) 返回 123，不抛出错误
        });
    });

    describe('serializeJSON', () => {
        it('应该序列化对象为 JSON 字符串', () => {
            const obj = { key: 'value', number: 123 };
            const result = serializeJSON(obj);
            expect(result).toBe('{"key":"value","number":123}');
        });

        it('应该返回 null 当值为 null', () => {
            expect(serializeJSON(null)).toBe(null);
        });

        it('应该返回 null 当值为 undefined', () => {
            expect(serializeJSON(undefined)).toBe(null);
        });

        it('应该序列化数组', () => {
            const arr = [1, 2, 3];
            const result = serializeJSON(arr);
            expect(result).toBe('[1,2,3]');
        });

        it('应该抛出错误当序列化循环引用', () => {
            const obj: any = { key: 'value' };
            obj.self = obj;

            expect(() => serializeJSON(obj)).toThrow();
        });

        it('应该抛出错误当序列化 BigInt', () => {
            const obj = { big: BigInt(123) };
            expect(() => serializeJSON(obj)).toThrow();
        });
    });

    describe('deserializeJSON', () => {
        it('应该反序列化有效的 JSON 字符串', () => {
            const jsonString = '{"key": "value", "number": 123}';
            const result = deserializeJSON(jsonString, {});
            expect(result).toEqual({ key: 'value', number: 123 });
        });

        it('应该返回默认值当 jsonString 为 null', () => {
            const defaultValue = { key: 'default' };
            const result = deserializeJSON(null, defaultValue);
            expect(result).toBe(defaultValue);
        });

        it('应该返回默认值当 jsonString 为 undefined', () => {
            const defaultValue = { key: 'default' };
            const result = deserializeJSON(undefined, defaultValue);
            expect(result).toBe(defaultValue);
        });

        it('应该返回默认值当 jsonString 为空字符串', () => {
            const defaultValue = { key: 'default' };
            const result = deserializeJSON('', defaultValue);
            expect(result).toBe(defaultValue);
        });

        it('应该返回默认值当 JSON 无效', () => {
            const defaultValue = { key: 'default' };
            const result = deserializeJSON('invalid json', defaultValue);
            expect(result).toBe(defaultValue);
        });

        it('应该使用 schema 验证当提供时', () => {
            const schema = z.object({
                key: z.string(),
                number: z.number()
            });
            const jsonString = '{"key": "value", "number": 123}';
            const result = deserializeJSON(jsonString, { key: '', number: 0 }, schema);
            expect(result).toEqual({ key: 'value', number: 123 });
        });

        it('应该返回默认值当 schema 验证失败', () => {
            const schema = z.object({
                key: z.string(),
                number: z.number()
            });
            const jsonString = '{"key": "value", "number": "not a number"}';
            const defaultValue = { key: 'default', number: 0 };
            const result = deserializeJSON(jsonString, defaultValue, schema);
            expect(result).toBe(defaultValue);
        });

        it('应该返回默认值当 schema 验证失败（缺少字段）', () => {
            const schema = z.object({
                key: z.string(),
                number: z.number()
            });
            const jsonString = '{"key": "value"}';
            const defaultValue = { key: 'default', number: 0 };
            const result = deserializeJSON(jsonString, defaultValue, schema);
            expect(result).toBe(defaultValue);
        });

        it('应该处理嵌套对象', () => {
            const jsonString = '{"nested": {"key": "value"}}';
            const result = deserializeJSON(jsonString, {});
            expect(result).toEqual({ nested: { key: 'value' } });
        });

        it('应该处理数组', () => {
            const jsonString = '[1, 2, 3]';
            const result = deserializeJSON(jsonString, []);
            expect(result).toEqual([1, 2, 3]);
        });
    });
});

