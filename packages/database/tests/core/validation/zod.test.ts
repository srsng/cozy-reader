import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { DatabaseError } from '../../../src/core/errors';
import { validateRecord, safeValidateRecord, isValidRecord } from '../../../src/core/validation/zod';

describe('zod validation', () => {
    const testSchema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.email().optional()
    });

    describe('validateRecord', () => {
        it('应该成功验证符合 schema 的记录', () => {
            const record = { name: 'John', age: 30 };
            const result = validateRecord(record, testSchema);
            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('应该成功验证包含可选字段的记录', () => {
            const record = { name: 'John', age: 30, email: 'john@example.com' };
            const result = validateRecord(record, testSchema);
            expect(result).toEqual({ name: 'John', age: 30, email: 'john@example.com' });
        });

        it('应该抛出 DatabaseError 当验证失败（ZodError）', () => {
            const record = { name: 'John', age: 'not a number' };
            expect(() => validateRecord(record, testSchema)).toThrow(DatabaseError);
            expect(() => validateRecord(record, testSchema)).toThrow('Record validation failed');
        });

        it('应该包含详细的错误信息', () => {
            const record = { name: 123, age: 'not a number' };
            try {
                validateRecord(record, testSchema);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).message).toContain('Record validation failed');
            }
        });

        it('应该抛出 DatabaseError 当发生其他错误', () => {
            const invalidSchema = z.object({
                name: z.string()
            });
            // 创建一个会导致解析错误的记录
            const record = null;
            expect(() => validateRecord(record, invalidSchema)).toThrow(DatabaseError);
        });
    });

    describe('safeValidateRecord', () => {
        it('应该返回验证后的记录当验证成功', () => {
            const record = { name: 'John', age: 30 };
            const defaultValue = { name: 'Default', age: 0 };
            const result = safeValidateRecord(record, testSchema, defaultValue);
            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('应该返回默认值当验证失败', () => {
            const record = { name: 'John', age: 'not a number' };
            const defaultValue = { name: 'Default', age: 0 };
            const result = safeValidateRecord(record, testSchema, defaultValue);
            expect(result).toBe(defaultValue);
        });

        it('应该返回默认值当记录为 null', () => {
            const defaultValue = { name: 'Default', age: 0 };
            const result = safeValidateRecord(null, testSchema, defaultValue);
            expect(result).toBe(defaultValue);
        });

        it('应该返回默认值当记录缺少必需字段', () => {
            const record = { name: 'John' };
            const defaultValue = { name: 'Default', age: 0 };
            const result = safeValidateRecord(record, testSchema, defaultValue);
            expect(result).toBe(defaultValue);
        });
    });

    describe('isValidRecord', () => {
        it('应该返回 true 当记录符合 schema', () => {
            const record = { name: 'John', age: 30 };
            expect(isValidRecord(record, testSchema)).toBe(true);
        });

        it('应该返回 false 当记录不符合 schema', () => {
            const record = { name: 'John', age: 'not a number' };
            expect(isValidRecord(record, testSchema)).toBe(false);
        });

        it('应该返回 false 当记录缺少必需字段', () => {
            const record = { name: 'John' };
            expect(isValidRecord(record, testSchema)).toBe(false);
        });

        it('应该返回 false 当记录为 null', () => {
            expect(isValidRecord(null, testSchema)).toBe(false);
        });

        it('应该返回 true 当记录包含可选字段', () => {
            const record = { name: 'John', age: 30, email: 'john@example.com' };
            expect(isValidRecord(record, testSchema)).toBe(true);
        });

        it('应该返回 false 当可选字段格式错误', () => {
            const record = { name: 'John', age: 30, email: 'not an email' };
            expect(isValidRecord(record, testSchema)).toBe(false);
        });
    });
});

