import { describe, it, expect } from 'vitest';
import { buildSortClause, buildPaginationClause, buildSearchCondition, buildTagFilterCondition, buildSoftDeleteCondition, escapeLikeQuery } from '../../../src/core/query';

describe('queryBuilder', () => {
    describe('buildSortClause', () => {
        it('应该使用提供的排序字段', () => {
            const fieldMap = { 'title': 'title', 'addedAt': 'added_at' };
            const result = buildSortClause('title', 'asc', fieldMap, 'added_at');
            expect(result).toBe('title ASC');
        });

        it('应该使用默认排序字段当提供的字段不存在时', () => {
            const fieldMap = { 'title': 'title' };
            const result = buildSortClause('invalid', 'desc', fieldMap, 'added_at');
            expect(result).toBe('added_at DESC');
        });

        it('应该使用默认排序字段当未提供排序字段时', () => {
            const fieldMap = { 'title': 'title' };
            const result = buildSortClause(undefined, 'desc', fieldMap, 'added_at');
            expect(result).toBe('added_at DESC');
        });

        it('应该默认使用 DESC 当未提供排序方向时', () => {
            const fieldMap = { 'title': 'title' };
            const result = buildSortClause('title', undefined, fieldMap, 'added_at');
            expect(result).toBe('title DESC');
        });
    });

    describe('buildPaginationClause', () => {
        it('应该构建 LIMIT 子句', () => {
            const result = buildPaginationClause(10);
            expect(result.clause).toBe('LIMIT ?');
            expect(result.params).toEqual([10]);
        });

        it('应该构建 LIMIT 和 OFFSET 子句', () => {
            const result = buildPaginationClause(10, 20);
            expect(result.clause).toBe('LIMIT ? OFFSET ?');
            expect(result.params).toEqual([10, 20]);
        });

        it('应该返回空子句当 limit 未定义时', () => {
            const result = buildPaginationClause();
            expect(result.clause).toBe('');
            expect(result.params).toEqual([]);
        });

        it('应该忽略 offset 当 limit 未定义时', () => {
            const result = buildPaginationClause(undefined, 20);
            expect(result.clause).toBe('');
            expect(result.params).toEqual([]);
        });

        it('应该忽略 offset 当 offset 为 0 时', () => {
            const result = buildPaginationClause(10, 0);
            expect(result.clause).toBe('LIMIT ?');
            expect(result.params).toEqual([10]);
        });
    });

    describe('buildSearchCondition', () => {
        it('应该构建搜索条件', () => {
            const result = buildSearchCondition('test', ['title', 'author']);
            expect(result.condition).toBe('(title LIKE ? OR author LIKE ?)');
            expect(result.params).toEqual(['%test%', '%test%']);
        });

        it('应该返回空条件当搜索词为空时', () => {
            const result = buildSearchCondition('', ['title']);
            expect(result.condition).toBe('');
            expect(result.params).toEqual([]);
        });

        it('应该返回空条件当字段数组为空时', () => {
            const result = buildSearchCondition('test', []);
            expect(result.condition).toBe('');
            expect(result.params).toEqual([]);
        });

        it('应该使用转义函数当提供时', () => {
            const escapeFn = (str: string) => str.replace(/[%_]/g, '\\$&');
            const result = buildSearchCondition('test%', ['title'], escapeFn);
            expect(result.condition).toBe('(title LIKE ?)');
            expect(result.params).toEqual(['%test\\%%']);
        });
    });

    describe('buildTagFilterCondition', () => {
        it('应该构建标签筛选条件', () => {
            const result = buildTagFilterCondition(['fiction', 'sci-fi']);
            expect(result.condition).toBe('(EXISTS (SELECT 1 FROM json_each(tags) WHERE json_each.value = ?) OR EXISTS (SELECT 1 FROM json_each(tags) WHERE json_each.value = ?))');
            expect(result.params).toEqual(['fiction', 'sci-fi']);
        });

        it('应该返回空条件当标签数组为空时', () => {
            const result = buildTagFilterCondition([]);
            expect(result.condition).toBe('');
            expect(result.params).toEqual([]);
        });

        it('应该使用自定义标签列名', () => {
            const result = buildTagFilterCondition(['fiction'], 'custom_tags');
            expect(result.condition).toBe('(EXISTS (SELECT 1 FROM json_each(custom_tags) WHERE json_each.value = ?))');
            expect(result.params).toEqual(['fiction']);
        });
    });

    describe('buildSoftDeleteCondition', () => {
        it('应该返回默认的软删除条件', () => {
            const result = buildSoftDeleteCondition();
            expect(result).toBe('deleted_at IS NULL');
        });

        it('应该使用自定义列名', () => {
            const result = buildSoftDeleteCondition('removed_at');
            expect(result).toBe('removed_at IS NULL');
        });

        it('当 includeDeleted 为 true 时应该返回 1=1', () => {
            const result = buildSoftDeleteCondition('deleted_at', true);
            expect(result).toBe('1=1');
        });

        it('应该同时支持自定义列名和 includeDeleted', () => {
            const result = buildSoftDeleteCondition('removed_at', true);
            expect(result).toBe('1=1');
        });
    });

    describe('escapeLikeQuery', () => {
        it('应该转义 % 字符', () => {
            const result = escapeLikeQuery('test%value');
            expect(result).toBe('test\\%value');
        });

        it('应该转义 _ 字符', () => {
            const result = escapeLikeQuery('test_value');
            expect(result).toBe('test\\_value');
        });

        it('应该转义多个特殊字符', () => {
            const result = escapeLikeQuery('test%_value');
            expect(result).toBe('test\\%\\_value');
        });

        it('应该处理没有特殊字符的字符串', () => {
            const result = escapeLikeQuery('testvalue');
            expect(result).toBe('testvalue');
        });
    });
});

