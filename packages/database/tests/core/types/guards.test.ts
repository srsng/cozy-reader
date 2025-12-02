import { describe, it, expect } from 'vitest';
import {
    isType,
    isSuccessResult,
    isErrorResult,
    isRecord,
    isArray
} from '../../../src/core/types/guards';
import type { DatabaseResult } from '../../../src/core/types';

describe('type guards', () => {
    describe('isType', () => {
        it('应该使用自定义 validator 检查类型', () => {
            const isString = (v: unknown): v is string => typeof v === 'string';
            expect(isType('test', isString)).toBe(true);
            expect(isType(123, isString)).toBe(false);
        });

        it('应该与类型守卫函数配合使用', () => {
            const isNumber = (v: unknown): v is number => typeof v === 'number';
            expect(isType(123, isNumber)).toBe(true);
            expect(isType('123', isNumber)).toBe(false);
        });
    });

    describe('isSuccessResult', () => {
        it('应该返回 true 对于成功结果', () => {
            const result: DatabaseResult<string> = { success: true, data: 'test' };
            expect(isSuccessResult(result)).toBe(true);
        });

        it('应该返回 false 对于失败结果', () => {
            const result: DatabaseResult<string> = {
                success: false,
                error: 'Error message'
            };
            expect(isSuccessResult(result)).toBe(false);
        });

        it('应该正确进行类型收窄', () => {
            const result: DatabaseResult<string> = { success: true, data: 'test' };
            if (isSuccessResult(result)) {
                // TypeScript 应该知道这里是成功结果
                expect(result.data).toBe('test');
            }
        });
    });

    describe('isErrorResult', () => {
        it('应该返回 true 对于失败结果', () => {
            const result: DatabaseResult<string> = {
                success: false,
                error: 'Error message',
                code: 'OPERATION_FAILED'
            };
            expect(isErrorResult(result)).toBe(true);
        });

        it('应该返回 false 对于成功结果', () => {
            const result: DatabaseResult<string> = { success: true, data: 'test' };
            expect(isErrorResult(result)).toBe(false);
        });

        it('应该正确进行类型收窄', () => {
            const result: DatabaseResult<string> = {
                success: false,
                error: 'Error message'
            };
            if (isErrorResult(result)) {
                // TypeScript 应该知道这里是失败结果
                expect(result.error).toBe('Error message');
            }
        });
    });

    describe('isRecord', () => {
        it('应该返回 true 对于对象', () => {
            expect(isRecord({ key: 'value' })).toBe(true);
            expect(isRecord({})).toBe(true);
            expect(isRecord({ nested: { key: 'value' } })).toBe(true);
        });

        it('应该返回 false 对于 null', () => {
            expect(isRecord(null)).toBe(false);
        });

        it('应该返回 false 对于数组', () => {
            expect(isRecord([1, 2, 3])).toBe(false);
            expect(isRecord([])).toBe(false);
        });

        it('应该返回 false 对于基本类型', () => {
            expect(isRecord('string')).toBe(false);
            expect(isRecord(123)).toBe(false);
            expect(isRecord(true)).toBe(false);
            expect(isRecord(undefined)).toBe(false);
        });
    });

    describe('isArray', () => {
        it('应该返回 true 对于数组', () => {
            expect(isArray([1, 2, 3])).toBe(true);
            expect(isArray([])).toBe(true);
            expect(isArray(['a', 2, 'c'])).toBe(true);
        });

        it('应该返回 false 对于非数组', () => {
            expect(isArray({})).toBe(false);
            expect(isArray('string')).toBe(false);
            expect(isArray(123)).toBe(false);
            expect(isArray(null)).toBe(false);
        });

        it('应该使用 itemValidator 验证数组元素', () => {
            const isString = (item: unknown): item is string => typeof item === 'string';
            expect(isArray(['a', 'b', 'c'], isString)).toBe(true);
            expect(isArray(['a', 123, 'c'], isString)).toBe(false);
            expect(isArray([], isString)).toBe(true);
        });

        it('应该返回 true 当没有提供 itemValidator', () => {
            expect(isArray([1, 2, 3])).toBe(true);
            expect(isArray(['a', 'b'])).toBe(true);
            expect(isArray([null, undefined])).toBe(true);
        });
    });
});

