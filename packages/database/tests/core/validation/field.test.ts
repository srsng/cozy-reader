import { describe, it, expect } from 'vitest';
import { DatabaseError } from '../../../src/core/errors';
import {
    isValidFieldName,
    isValidTableName,
    isValidColumnName,
    isFieldAllowed,
    extractFieldNameFromUpdateClause,
    validateUpdateClauses
} from '../../../src/core/validation/field';

describe('field validation', () => {
    describe('isValidFieldName', () => {
        it('应该返回 true 对于有效的字段名', () => {
            expect(isValidFieldName('title')).toBe(true);
            expect(isValidFieldName('title_123')).toBe(true);
            expect(isValidFieldName('_private')).toBe(true);
            expect(isValidFieldName('user_name')).toBe(true);
            expect(isValidFieldName('table.column')).toBe(true);
        });

        it('应该返回 false 对于数字开头的字段名', () => {
            expect(isValidFieldName('123title')).toBe(false);
            expect(isValidFieldName('0field')).toBe(false);
        });

        it('应该返回 false 对于包含特殊字符的字段名', () => {
            expect(isValidFieldName('title-name')).toBe(false);
            expect(isValidFieldName('title name')).toBe(false);
            expect(isValidFieldName('title@name')).toBe(false);
            expect(isValidFieldName('title; DROP TABLE')).toBe(false);
        });

        it('应该返回 false 对于连续的点号', () => {
            expect(isValidFieldName('table..column')).toBe(false);
            expect(isValidFieldName('a..b')).toBe(false);
        });

        it('应该返回 false 对于以点号结尾的字段名', () => {
            expect(isValidFieldName('table.')).toBe(false);
            expect(isValidFieldName('column.')).toBe(false);
        });

        it('应该返回 false 对于空字符串', () => {
            expect(isValidFieldName('')).toBe(false);
        });
    });

    describe('isValidTableName', () => {
        it('应该委托给 isValidFieldName', () => {
            expect(isValidTableName('books')).toBe(true);
            expect(isValidTableName('123books')).toBe(false);
            expect(isValidTableName('books; DROP')).toBe(false);
        });
    });

    describe('isValidColumnName', () => {
        it('应该委托给 isValidFieldName', () => {
            expect(isValidColumnName('title')).toBe(true);
            expect(isValidColumnName('123title')).toBe(false);
            expect(isValidColumnName('title; DROP')).toBe(false);
        });
    });

    describe('isFieldAllowed', () => {
        it('应该返回 true 当字段在白名单中', () => {
            const allowedFields = ['title', 'author', 'status'];
            expect(isFieldAllowed('title', allowedFields)).toBe(true);
            expect(isFieldAllowed('author', allowedFields)).toBe(true);
        });

        it('应该返回 false 当字段不在白名单中', () => {
            const allowedFields = ['title', 'author', 'status'];
            expect(isFieldAllowed('description', allowedFields)).toBe(false);
            expect(isFieldAllowed('id', allowedFields)).toBe(false);
        });

        it('应该返回 false 当字段名无效', () => {
            const allowedFields = ['title', 'author', 'status'];
            expect(isFieldAllowed('title; DROP', allowedFields)).toBe(false);
            expect(isFieldAllowed('123title', allowedFields)).toBe(false);
        });
    });

    describe('extractFieldNameFromUpdateClause', () => {
        it('应该从更新子句中提取字段名', () => {
            expect(extractFieldNameFromUpdateClause('title = ?')).toBe('title');
            expect(extractFieldNameFromUpdateClause('  author = ?  ')).toBe('author');
            expect(extractFieldNameFromUpdateClause('status = ?')).toBe('status');
        });

        it('应该返回 null 当格式不正确', () => {
            expect(extractFieldNameFromUpdateClause('title = value')).toBe(null);
            expect(extractFieldNameFromUpdateClause('title =')).toBe(null);
            expect(extractFieldNameFromUpdateClause('= ?')).toBe(null);
            expect(extractFieldNameFromUpdateClause('title ?')).toBe(null);
        });

        it('应该返回 null 当为空字符串', () => {
            expect(extractFieldNameFromUpdateClause('')).toBe(null);
        });

        it('应该提取带下划线的字段名', () => {
            expect(extractFieldNameFromUpdateClause('created_at = ?')).toBe('created_at');
            expect(extractFieldNameFromUpdateClause('user_name = ?')).toBe('user_name');
        });
    });

    describe('validateUpdateClauses', () => {
        it('应该通过验证当所有字段都在白名单中', () => {
            const clauses = ['title = ?', 'author = ?'];
            const allowedFields = ['title', 'author', 'status'];
            expect(() => validateUpdateClauses(clauses, allowedFields)).not.toThrow();
        });

        it('应该抛出错误当字段不在白名单中', () => {
            const clauses = ['title = ?', 'invalid_field = ?'];
            const allowedFields = ['title', 'author', 'status'];
            expect(() => validateUpdateClauses(clauses, allowedFields)).toThrow(DatabaseError);
            expect(() => validateUpdateClauses(clauses, allowedFields)).toThrow('not allowed');
        });

        it('应该抛出错误当更新子句格式错误', () => {
            const clauses = ['title = ?', 'invalid format'];
            const allowedFields = ['title', 'author'];
            expect(() => validateUpdateClauses(clauses, allowedFields)).toThrow(DatabaseError);
            expect(() => validateUpdateClauses(clauses, allowedFields)).toThrow('Invalid update clause format');
        });

        it('应该抛出错误当字段名无效', () => {
            const clauses = ['title = ?', '123invalid = ?'];
            const allowedFields = ['title'];
            expect(() => validateUpdateClauses(clauses, allowedFields)).toThrow(DatabaseError);
        });

        it('应该处理空数组', () => {
            const clauses: string[] = [];
            const allowedFields = ['title'];
            expect(() => validateUpdateClauses(clauses, allowedFields)).not.toThrow();
        });
    });
});

