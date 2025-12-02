/**
 * 数据库注册表
 * 管理所有数据库的配置和注册状态
 */

import type { DatabaseConfig, DatabaseName } from '../types';
import { getDatabaseConfigs } from '../commands';

/**
 * 数据库注册表类
 */
export class DatabaseRegistry {
    private static instance: DatabaseRegistry;
    private configs = new Map<DatabaseName, DatabaseConfig>();
    private initialized = false;

    private constructor() { }

    /**
     * 异步初始化注册表（从后端获取配置）
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        const configs = await getDatabaseConfigs();
        for (const config of configs) {
            this.register(config);
        }

        this.initialized = true;
    }

    /**
     * 获取单例实例
     */
    static getInstance(): DatabaseRegistry {
        if (!DatabaseRegistry.instance) {
            DatabaseRegistry.instance = new DatabaseRegistry();
        }
        return DatabaseRegistry.instance;
    }

    /**
     * 注册数据库配置
     */
    register(config: DatabaseConfig): void {
        if (this.configs.has(config.name)) {
            throw new Error(`Database ${config.name} is already registered`);
        }
        this.configs.set(config.name, config);
    }

    /**
     * 获取数据库配置
     */
    getConfig(name: DatabaseName): DatabaseConfig {
        const config = this.configs.get(name);
        if (!config) {
            throw new Error(`Database ${name} is not registered`);
        }
        return config;
    }

    /**
     * 获取所有已注册的数据库名称
     */
    getAllNames(): DatabaseName[] {
        return Array.from(this.configs.keys());
    }

    /**
     * 检查数据库是否已注册
     */
    isRegistered(name: DatabaseName): boolean {
        return this.configs.has(name);
    }

    /**
     * 获取所有配置
     */
    getAllConfigs(): DatabaseConfig[] {
        if (!this.initialized) {
            throw new Error('DatabaseRegistry not initialized. Call initialize() first.');
        }
        return Array.from(this.configs.values());
    }

    /**
     * 检查是否已初始化
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

/**
 * 便捷函数：获取数据库配置
 */
export function getDatabaseConfigByName(name: DatabaseName): DatabaseConfig {
    return DatabaseRegistry.getInstance().getConfig(name);
}

