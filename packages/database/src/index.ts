/**
 * @cozy-reader/database 主入口
 * 统一导出所有模块
 */

// 核心模块（包含类型、Schema、数据库管理、错误处理、执行、验证、查询）
export * from './core';

// 工具函数
export * from './utils';

// 服务层
export * from './services';

// 通用类型（通过 core/types 统一导出）
export type { DatabaseResult, DatabaseErrorCode, DatabaseConfig, DatabaseName, BaseQueryOptions } from './core/types';
