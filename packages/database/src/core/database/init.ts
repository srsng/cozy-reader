/**
 * 数据库初始化函数
 */

import { DatabaseManager } from './manager';
import { DatabaseRegistry } from './registry';
import type { DatabaseConfig } from '../types';

/**
 * 验证数据库配置
 */
export function validateDatabaseConfigs(configs: DatabaseConfig[]): void {
    const names = new Set<string>();
    const filenames = new Set<string>();

    for (const config of configs) {
        // 验证必需字段
        if (!config.name || !config.filename) {
            throw new Error(`Invalid database config: missing required fields`);
        }
        // 检查名称唯一性
        if (names.has(config.name)) {
            throw new Error(`Duplicate database name: ${config.name}`);
        }
        names.add(config.name);

        // 检查文件名唯一性
        if (filenames.has(config.filename)) {
            throw new Error(`Duplicate database filename: ${config.filename}`);
        }
        filenames.add(config.filename);
    }
}

/**
 * 初始化所有数据库
 * 1. 从后端获取数据库配置并注册到 DatabaseRegistry
 * 2. 初始化数据库管理器（仅初始化注册表，不创建连接）
 * 
 * 注意：
 * - 迁移由 Rust 端通过 tauri_plugin_sql 在应用启动时自动处理
 * - 数据库连接按需创建，在调用 getDatabase() 时自动创建
 */
export async function initializeDatabases(): Promise<void> {
    const registry = DatabaseRegistry.getInstance();
    const manager = DatabaseManager.getInstance();

    // 初始化注册表（从后端获取配置）
    await registry.initialize();

    // 获取所有配置并验证
    const configs = registry.getAllConfigs();
    validateDatabaseConfigs(configs);

    // 初始化管理器（仅初始化注册表，不创建连接）
    await manager.initialize();
}

