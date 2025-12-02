/**
 * 基础服务类
 * 提供通用的 CRUD 操作
 */

import Database from '@tauri-apps/plugin-sql';
import { z } from 'zod';
import { DatabaseManager } from '../core/database';
import type { DatabaseName, DatabaseResult } from '../core/types';
import { DatabaseError, handleError } from '../core/errors';
import { isRecord } from '../core/types';
import { executeSelect, executeUpdate } from '../core/execution';
import { softDelete, hardDelete, restoreDeleted, isDeleted as checkIsDeleted } from '../core/query';
import { buildSortClause, buildPaginationClause, buildSoftDeleteCondition } from '../core/query';
import type { BaseQueryOptions } from '../core/types';
import { validateUpdateClauses } from '../core/validation';
import { deserializeJSON } from '../core/serialization';
import { validateRecord } from '../core/validation';

/**
 * JSON字段配置
 */
export interface JsonFieldConfig {
    /** 数据库字段名（snake_case） */
    fieldName: string;
    /** 默认值（当字段为null或解析失败时使用） */
    defaultValue: unknown;
    /** 是否允许为null（默认 false） */
    nullable?: boolean;
    /** 可选的Zod schema，用于运行时验证JSON字段 */
    schema?: z.ZodType<unknown>;
}

/**
 * 基础服务类配置
 */
export interface BaseServiceConfig<T = unknown> {
    /** 数据库名称 */
    databaseName: DatabaseName;
    /** 表名 */
    tableName: string;
    /** 默认排序字段（snake_case） */
    defaultSortField: string;
    /** 排序字段映射（camelCase -> snake_case） */
    sortFieldMap: Record<string, string>;
    /** 软删除列名（默认 'deleted_at'） */
    softDeleteColumn?: string;
    /** 允许更新的字段名列表（用于防止 SQL 注入） */
    allowedUpdateFields: string[];
    /** JSON字段配置列表 */
    jsonFields?: JsonFieldConfig[];
    /** 可选的Zod Schema用于运行时验证记录 */
    recordSchema?: z.ZodType<T>;
}

/**
 * 基础服务类
 * 提供通用的 CRUD 操作
 * 使用单例模式，所有方法都是实例方法
 */
export abstract class BaseService<T, TNew, TUpdate, TQueryOptions extends BaseQueryOptions> {
    protected config: BaseServiceConfig<T>;

    /**
     * 构造函数
     * @param config 服务配置
     */
    protected constructor(config: BaseServiceConfig<T>) {
        this.config = config;
    }

    /**
     * 获取单例实例（子类必须实现静态方法）
     * 注意：由于 TypeScript 不支持静态抽象方法，子类应实现静态 getInstance() 方法  
     * 并在构造函数中传入对应的config
     */
    // static getInstance(): XxxService { ... }
    //     if (!XxxService.instance) {
    //         XxxService.instance = new XxxService();
    //     }
    //     return XxxService.instance;
    // }

    /**
     * 构建插入字段和值（子类必须实现）
     * @param input 插入输入对象（类型 TNew）
     * @returns 字段名数组和对应的值数组
     */
    protected abstract buildInsertFields(input: TNew): {
        fields: string[];
        values: unknown[];
    };

    /**
     * 构建更新字段（子类必须实现）
     * @param input 更新输入对象（类型 TUpdate）
     * @param updates 更新字段数组（输出）
     * @param params 参数数组（输出）
     */
    protected abstract buildUpdateFields(
        input: TUpdate,
        updates: string[],
        params: unknown[]
    ): void;

    /**
     * 构建筛选条件（子类必须实现）
     * @param options 查询选项（类型 TQueryOptions）
     * @param conditions 条件数组（输出）
     * @param params 参数数组（输出）
     */
    protected abstract buildFilterConditions(
        options: TQueryOptions | undefined,
        conditions: string[],
        params: unknown[]
    ): void;

    /**
     * 获取数据库连接（静态工具方法，不依赖实例状态）
     */
    protected static async getDatabase(databaseName: DatabaseName): Promise<Database> {
        return await DatabaseManager.getInstance().getDatabase(databaseName);
    }

    /**
     * 获取软删除列名
     */
    protected getSoftDeleteColumn(): string {
        return this.config.softDeleteColumn || 'deleted_at';
    }

    /**
     * 构建软删除条件（显式调用）
     */
    protected buildSoftDeleteWhere(includeDeleted: boolean = false): string {
        return buildSoftDeleteCondition(this.getSoftDeleteColumn(), includeDeleted);
    }

    /**
     * 反序列化记录中的JSON字段
     * @param record 数据库记录
     * @returns 反序列化后的记录
     */
    protected deserializeRecordJsonFields(record: Record<string, unknown>): T {
        if (!isRecord(record)) {
            throw new DatabaseError(
                `Invalid record type: expected Record<string, unknown>`,
                'OPERATION_FAILED'
            );
        }

        // 如果没有JSON字段配置，直接返回（可能使用Zod验证）
        if (!this.config.jsonFields || this.config.jsonFields.length === 0) {
            const validated = this.config.recordSchema
                ? validateRecord(record, this.config.recordSchema)
                : (record as T);
            return validated;
        }

        // 处理JSON字段
        const deserialized: Record<string, unknown> = { ...record };
        for (const { fieldName, defaultValue, nullable, schema } of this.config.jsonFields) {
            const value = record[fieldName];

            if (value === null) {
                if (nullable) {
                    deserialized[fieldName] = null;
                } else {
                    // 非nullable字段为null时使用默认值
                    deserialized[fieldName] = defaultValue;
                }
            } else if (value === undefined) {
                // undefined值使用默认值
                deserialized[fieldName] = defaultValue;
            } else if (typeof value === 'string') {
                // 字符串类型，尝试反序列化JSON并使用schema验证
                deserialized[fieldName] = deserializeJSON(value, defaultValue, schema);
            } else {
                // 非字符串类型（可能是已经反序列化的对象），记录警告并使用原值
                // 如果原值不符合预期，使用默认值
                console.warn(
                    `Unexpected type for JSON field ${fieldName}: expected string, got ${typeof value}. Using original value.`
                );
                deserialized[fieldName] = value;
            }
        }

        // 使用类型守卫确保 deserialized 是 Record 类型
        if (!isRecord(deserialized)) {
            throw new DatabaseError(
                `Invalid deserialized record type`,
                'OPERATION_FAILED'
            );
        }

        // 如果提供了Zod schema，进行运行时验证
        if (this.config.recordSchema) {
            return validateRecord(deserialized, this.config.recordSchema);
        }

        return deserialized as T;
    }

    /**
     * 根据 ID 获取记录（内部方法，返回原始数据）
     */
    protected async _getById(id: number, includeDeleted: boolean = false): Promise<T> {
        const db = await BaseService.getDatabase(this.config.databaseName);
        const softDeleteCondition = this.buildSoftDeleteWhere(includeDeleted);

        const result = await executeSelect<Record<string, unknown>[]>(
            db,
            this.config.databaseName,
            `SELECT * FROM ${this.config.tableName} WHERE id = ? AND ${softDeleteCondition}`,
            [id],
            {
                operationName: `${this.config.tableName}.getById`
            }
        );

        if (result.length === 0) {
            throw new DatabaseError(
                `${this.config.tableName} with id ${id} not found`,
                'RECORD_NOT_FOUND'
            );
        }

        // 反序列化JSON字段
        return this.deserializeRecordJsonFields(result[0]);
    }

    /**
     * 根据 ID 获取记录（公共方法，返回 DatabaseResult）
     */
    async getById(id: number, includeDeleted: boolean = false): Promise<DatabaseResult<T>> {
        try {
            const data = await this._getById(id, includeDeleted);
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 创建记录（内部方法，返回原始数据）
     */
    protected async _create(input: TNew): Promise<T> {
        const db = await BaseService.getDatabase(this.config.databaseName);
        const { fields, values } = this.buildInsertFields(input);

        if (fields.length === 0) {
            throw new DatabaseError(
                `No fields to insert for table ${this.config.tableName}`,
                'MISSING_REQUIRED_FIELDS'
            );
        }

        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.config.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;

        const result = await executeUpdate(
            db,
            this.config.databaseName,
            sql,
            values,
            {
                operationName: `${this.config.tableName}.create`
            }
        );

        return await this._getById(result.lastInsertId);
    }

    /**
     * 创建记录（公共方法，返回 DatabaseResult）
     * 子类可以覆盖此方法以提供自定义实现
     */
    async create(input: TNew): Promise<DatabaseResult<T>> {
        try {
            const data = await this._create(input);
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 更新记录（内部方法，返回原始数据）
     */
    protected async _update(id: number, input: TUpdate): Promise<T> {
        const db = await BaseService.getDatabase(this.config.databaseName);

        const updates: string[] = [];
        const params: unknown[] = [];

        // 构建更新字段（子类可以覆盖此方法以自定义逻辑）
        this.buildUpdateFields(input, updates, params);

        if (updates.length === 0) {
            return await this._getById(id);
        }

        // 验证字段名，防止 SQL 注入
        try {
            validateUpdateClauses(updates, this.config.allowedUpdateFields);
        } catch (error) {
            throw new DatabaseError(
                `Invalid field name in update: ${error instanceof Error ? error.message : String(error)}`,
                'OPERATION_FAILED',
                error
            );
        }

        params.push(id);
        const softDeleteCondition = this.buildSoftDeleteWhere(false);

        await executeUpdate(
            db,
            this.config.databaseName,
            `UPDATE ${this.config.tableName} SET ${updates.join(', ')} WHERE id = ? AND ${softDeleteCondition}`,
            params,
            {
                operationName: `${this.config.tableName}.update`
            }
        );

        return await this._getById(id);
    }

    /**
     * 更新记录（公共方法，返回 DatabaseResult）
     */
    async update(id: number, input: TUpdate): Promise<DatabaseResult<T>> {
        try {
            const data = await this._update(id, input);
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 列表查询（内部方法，返回原始数据）
     */
    protected async _list(options?: TQueryOptions, includeDeleted: boolean = false): Promise<T[]> {
        const db = await BaseService.getDatabase(this.config.databaseName);

        let query = `SELECT * FROM ${this.config.tableName}`;
        const params: unknown[] = [];
        const conditions: string[] = [];

        // 添加软删除条件
        const softDeleteCondition = this.buildSoftDeleteWhere(includeDeleted);
        conditions.push(softDeleteCondition);

        // 构建筛选条件
        this.buildFilterConditions(options, conditions, params);

        // 添加筛选条件
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // 排序
        const orderClause = buildSortClause(
            options?.sortBy,
            options?.sortOrder,
            this.config.sortFieldMap,
            this.config.defaultSortField
        );
        query += ` ORDER BY ${orderClause}`;

        // 分页
        const pagination = buildPaginationClause(options?.limit, options?.offset);
        if (pagination.clause) {
            query += ' ' + pagination.clause;
            params.push(...pagination.params);
        }

        const result = await executeSelect<Record<string, unknown>[]>(
            db,
            this.config.databaseName,
            query,
            params,
            {
                operationName: `${this.config.tableName}.list`
            }
        );

        // 反序列化每条记录的JSON字段
        return result.map(record => this.deserializeRecordJsonFields(record));
    }

    /**
     * 列表查询（公共方法，返回 DatabaseResult）
     */
    async list(options?: TQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<T[]>> {
        try {
            const data = await this._list(options, includeDeleted);
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 获取总数（内部方法，返回原始数据）
     */
    protected async _getCount(options?: TQueryOptions, includeDeleted: boolean = false): Promise<number> {
        const db = await BaseService.getDatabase(this.config.databaseName);

        let query = `SELECT COUNT(*) as count FROM ${this.config.tableName}`;
        const params: unknown[] = [];
        const conditions: string[] = [];

        // 添加软删除条件
        const softDeleteCondition = this.buildSoftDeleteWhere(includeDeleted);
        conditions.push(softDeleteCondition);

        this.buildFilterConditions(options, conditions, params);

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await executeSelect<{ count: number }[]>(
            db,
            this.config.databaseName,
            query,
            params,
            {
                operationName: `${this.config.tableName}.getCount`
            }
        );

        return result[0].count;
    }

    /**
     * 获取总数（公共方法，返回 DatabaseResult）
     */
    async getCount(options?: TQueryOptions, includeDeleted: boolean = false): Promise<DatabaseResult<number>> {
        try {
            const data = await this._getCount(options, includeDeleted);
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 软删除（内部方法）
     */
    protected async _softDelete(id: number): Promise<void> {
        const db = await BaseService.getDatabase(this.config.databaseName);
        await softDelete(db, this.config.databaseName, this.config.tableName, id, this.getSoftDeleteColumn());
    }

    /**
     * 软删除（公共方法，返回 DatabaseResult）
     */
    async softDelete(id: number): Promise<DatabaseResult<void>> {
        try {
            await this._softDelete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 硬删除（内部方法）
     */
    protected async _hardDelete(id: number): Promise<void> {
        const db = await BaseService.getDatabase(this.config.databaseName);
        await hardDelete(db, this.config.databaseName, this.config.tableName, id, {
            operationName: `${this.config.tableName}.hardDelete`
        });
    }

    /**
     * 硬删除（公共方法，返回 DatabaseResult）
     */
    async hardDelete(id: number): Promise<DatabaseResult<void>> {
        try {
            await this._hardDelete(id);
            return { success: true, data: undefined };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 恢复（内部方法，返回原始数据）
     */
    protected async _restore(id: number): Promise<T> {
        const db = await BaseService.getDatabase(this.config.databaseName);
        await restoreDeleted(db, this.config.databaseName, this.config.tableName, id, this.getSoftDeleteColumn(), {
            operationName: `${this.config.tableName}.restore`
        });
        return await this._getById(id);
    }

    /**
     * 恢复（公共方法，返回 DatabaseResult）
     */
    async restore(id: number): Promise<DatabaseResult<T>> {
        try {
            const data = await this._restore(id);
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 检查记录是否已软删除
     * @param id 记录 ID
     * @returns 如果记录已软删除返回 true，未删除返回 false
     */
    async isDeleted(id: number): Promise<DatabaseResult<boolean>> {
        try {
            const db = await BaseService.getDatabase(this.config.databaseName);
            const data = await checkIsDeleted(
                db,
                this.config.databaseName,
                this.config.tableName,
                id,
                this.getSoftDeleteColumn(),
                {
                    operationName: `${this.config.tableName}.isDeleted`
                }
            );
            return { success: true, data };
        } catch (error) {
            return BaseService.handleError(error, this.config.databaseName);
        }
    }

    /**
     * 通用错误处理辅助函数
     * @param error 捕获的错误
     * @param databaseName 数据库名称
     * @returns DatabaseResult<never>
     */
    public static handleError(error: unknown, databaseName: DatabaseName): DatabaseResult<never> {
        return handleError(error, databaseName);
    }
}
