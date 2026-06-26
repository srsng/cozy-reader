/**
 * 数据库核心模块统一导出
 */

export { DatabaseManager } from './manager';
export { DatabaseRegistry, getDatabaseConfigByName } from './registry';
export {
    initializeDatabases,
    validateDatabaseConfigs,
    type InitializeDatabasesOptions
} from './init';
export * from './transaction';
