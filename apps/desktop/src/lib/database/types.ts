/**
 * 通用数据库操作结果类型
 */
export interface DatabaseResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * 数据库错误类型
 */
export class DatabaseError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}

/**
 * 通用查询选项
 */
export interface BaseQueryOptions {
    /** 搜索关键词 */
    search?: string;
    /** 排序字段 */
    sort_by?: string;
    /** 排序方向 */
    sort_order?: 'asc' | 'desc';
    /** 分页偏移量 */
    offset?: number;
    /** 分页限制 */
    limit?: number;
}

/**
 * 数据库配置接口
 */
export interface DatabaseConfig {
    /** 数据库文件名, e.g. books.db */
    filename: string;
    /** 数据库版本, e.g. 1.0 */
    version: number;
    /** 是否启用 WAL 模式 */
    wal: boolean;
}
