/**
 * 核心类型定义统一导出
 */

// 从 Rust 生成的类型导入
export type { DatabaseConfig } from './generated/DatabaseConfig';
export type { DatabaseName } from './generated/DatabaseName';

/**
 * 数据库错误代码类型
 */
export type DatabaseErrorCode =
    | 'RECORD_NOT_FOUND'           // 记录不存在
    | 'QUERY_FAILED'               // 查询失败
    | 'OPERATION_FAILED'           // 操作失败
    | 'UNSUPPORTED_FILE_FORMAT'    // 不支持的文件格式
    | 'BOOK_ALREADY_EXISTS'        // 书籍已存在
    | 'MISSING_REQUIRED_FIELDS'    // 缺少必需字段
    | 'TRANSACTION_FAILED'         // 事务失败
    | 'SAVEPOINT_NOT_FOUND'        // 保存点不存在
    | 'UNKNOWN_ERROR';             // 未知错误

/**
 * 数据库操作结果类型
 */
export type DatabaseResult<T> =
    | { success: true; data: T, error?: never }
    | {
        success: false;
        data?: T;
        error: string;                    // 错误消息
        code?: DatabaseErrorCode;         // 错误代码
        cause?: unknown;                  // 原始错误（可选）
    };

/**
 * 排序方向
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 基础查询选项（包含排序和分页）
 */
export interface BaseQueryOptions {
    /** 排序字段（camelCase，需要在服务层映射到 snake_case） */
    sortBy?: string;
    /** 排序方向 */
    sortOrder?: SortOrder;
    /** 分页限制 */
    limit?: number;
    /** 分页偏移量 */
    offset?: number;
}

// 导出类型守卫函数
export * from './guards';

// 导出业务类型
export * from './books';

