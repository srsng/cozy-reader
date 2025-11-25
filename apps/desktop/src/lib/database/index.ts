export * from './book';

// 导出数据库初始化函数
export { initializeDatabases, validateDatabaseConfigs } from './init';

// 导出通用数据库类型和工具
export type { DatabaseResult, DatabaseConfig, BaseQueryOptions } from './types';
export { DatabaseError } from './types';
export { DatabaseErrorHandler } from './utils/databaseErrorHandler';
export * from './utils/sql';

// 导出多数据库管理相关
export * from './const';
export { DatabaseRegistry } from './registry';
export { DatabaseManager } from './manager';
export { Transaction, MultiDatabaseTransaction } from './transaction';
export { PerformanceMonitor, executeWithMonitoring } from './performance';
export type { QueryPerformanceStats, PerformanceMonitorConfig } from './performance';

// 导出工具函数
export {
    timestampToISOString,
    isoStringToTimestamp,
    getCurrentTimestamp,
    TimeFieldConverter,
    formatReadingTime
} from './utils/time';
export {
    softDelete,
    hardDelete,
    restoreDeleted,
    buildSoftDeleteCondition
} from './utils/softDelete';
export {
    isValidJSON,
    safeParseJSON,
} from './utils/json';
