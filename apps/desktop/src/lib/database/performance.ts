import type Database from '@tauri-apps/plugin-sql';
import type { DB_NAME } from './const';

/**
 * 查询性能统计
 */
export interface QueryPerformanceStats {
    /** 数据库名称 */
    databaseName: DB_NAME;
    /** 查询 SQL */
    sql: string;
    /** 执行时间（毫秒） */
    duration: number;
    /** 执行时间戳 */
    timestamp: number;
    /** 参数 */
    params?: any[];
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
    /** 慢查询阈值（毫秒），默认 100ms */
    slowQueryThreshold: number;
    /** 是否启用监控 */
    enabled: boolean;
    /** 最大记录数，默认 1000 */
    maxRecords: number;
}

/**
 * 数据库性能监控器
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private stats: QueryPerformanceStats[] = [];
    private config: PerformanceMonitorConfig = {
        slowQueryThreshold: 100,
        enabled: true,
        maxRecords: 1000
    };

    private constructor() {}

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * 配置性能监控
     */
    configure(config: Partial<PerformanceMonitorConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * 记录查询性能
     */
    recordQuery(
        databaseName: DB_NAME,
        sql: string,
        duration: number,
        params?: any[]
    ): void {
        if (!this.config.enabled) {
            return;
        }

        const stat: QueryPerformanceStats = {
            databaseName,
            sql,
            duration,
            timestamp: Date.now(),
            params
        };

        this.stats.push(stat);

        // 限制记录数量
        if (this.stats.length > this.config.maxRecords) {
            this.stats.shift();
        }

        // 记录慢查询
        if (duration >= this.config.slowQueryThreshold) {
            console.warn(
                `[${databaseName}] Slow query detected (${duration}ms):`,
                sql,
                params ? `Params: ${JSON.stringify(params)}` : ''
            );
        }
    }

    /**
     * 获取性能统计
     */
    getStats(databaseName?: DB_NAME): QueryPerformanceStats[] {
        if (databaseName) {
            return this.stats.filter(s => s.databaseName === databaseName);
        }
        return [...this.stats];
    }

    /**
     * 获取慢查询统计
     */
    getSlowQueries(databaseName?: DB_NAME): QueryPerformanceStats[] {
        const filtered = databaseName
            ? this.stats.filter(s => s.databaseName === databaseName)
            : this.stats;
        return filtered.filter(s => s.duration >= this.config.slowQueryThreshold);
    }

    /**
     * 获取平均查询时间
     */
    getAverageQueryTime(databaseName?: DB_NAME): number {
        const filtered = databaseName
            ? this.stats.filter(s => s.databaseName === databaseName)
            : this.stats;
        if (filtered.length === 0) {
            return 0;
        }
        const total = filtered.reduce((sum, s) => sum + s.duration, 0);
        return total / filtered.length;
    }

    /**
     * 清除统计
     */
    clearStats(databaseName?: DB_NAME): void {
        if (databaseName) {
            this.stats = this.stats.filter(s => s.databaseName !== databaseName);
        } else {
            this.stats = [];
        }
    }

    /**
     * 包装数据库查询，自动记录性能
     */
    async wrapQuery<T>(
        databaseName: DB_NAME,
        sql: string,
        queryFn: () => Promise<T>,
        params?: any[]
    ): Promise<T> {
        const startTime = performance.now();
        try {
            const result = await queryFn();
            const duration = performance.now() - startTime;
            this.recordQuery(databaseName, sql, duration, params);
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordQuery(databaseName, sql, duration, params);
            throw error;
        }
    }
}

/**
 * 数据库查询包装器
 * 自动记录查询性能
 */
export async function executeWithMonitoring<T>(
    databaseName: DB_NAME,
    db: Database,
    sql: string,
    params?: any[]
): Promise<T> {
    const monitor = PerformanceMonitor.getInstance();
    return await monitor.wrapQuery(
        databaseName,
        sql,
        async () => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                return await db.select<T>(sql, params) as T;
            } else {
                return await db.execute(sql, params) as T;
            }
        },
        params
    );
}

