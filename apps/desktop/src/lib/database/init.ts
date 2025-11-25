import { DatabaseRegistry } from './registry';
import { DB_ENUM, DB_CONFIG_MAP } from './const';
import type { DatabaseConfig } from './types';
import { getDatabaseConfigs } from '$lib/apis/db';


/**
 * 验证前后端数据库配置是否一致
 * @throws Error 如果配置不一致
 */
export async function validateDatabaseConfigs(): Promise<void> {
    const backendConfigs = await getDatabaseConfigs();

    // 检查数量是否一致
    const frontendCount = Object.keys(DB_CONFIG_MAP).length;
    if (backendConfigs.length !== frontendCount) {
        throw new Error(
            `Database count mismatch: frontend has ${frontendCount}, backend has ${backendConfigs.length}`
        );
    }

    // 检查每个数据库配置是否一致
    for (const backendConfig of backendConfigs) {
        const dbName = backendConfig.name as DB_ENUM;
        const frontendConfig = DB_CONFIG_MAP[dbName];

        if (!frontendConfig) {
            throw new Error(
                `Database "${dbName}" exists in backend but not in frontend`
            );
        }

        // 检查名称
        if (frontendConfig.name !== backendConfig.name) {
            throw new Error(
                `Database "${dbName}" name mismatch: frontend="${frontendConfig.name}", backend="${backendConfig.name}"`
            );
        }

        // 检查文件名
        if (frontendConfig.filename !== backendConfig.filename) {
            throw new Error(
                `Database "${dbName}" filename mismatch: frontend="${frontendConfig.filename}", backend="${backendConfig.filename}"`
            );
        }

        // 检查 WAL 配置
        if (frontendConfig.wal !== backendConfig.wal) {
            throw new Error(
                `Database "${dbName}" WAL config mismatch: frontend=${frontendConfig.wal}, backend=${backendConfig.wal}`
            );
        }
    }

    // 检查前端是否有后端不存在的数据库
    for (const dbName of Object.keys(DB_CONFIG_MAP) as DB_ENUM[]) {
        const existsInBackend = backendConfigs.some(c => c.name === dbName);
        if (!existsInBackend) {
            throw new Error(
                `Database "${dbName}" exists in frontend but not in backend`
            );
        }
    }
}

/**
 * 初始化数据库配置
 * 先验证一致性，然后注册到 DatabaseRegistry
 */
export async function initializeDatabases(): Promise<void> {
    // 1. 验证前后端配置一致性
    await validateDatabaseConfigs();

    // 2. 注册所有数据库配置
    for (const [dbName, config] of Object.entries(DB_CONFIG_MAP) as [DB_ENUM, DatabaseConfig][]) {
        DatabaseRegistry.register(dbName, config);
    }

    console.log(`Initialized ${Object.keys(DB_CONFIG_MAP).length} database(s)`);
}
