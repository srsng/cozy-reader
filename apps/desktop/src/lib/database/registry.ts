import type { DatabaseConfig } from './types';
import type { DB_NAME } from './const';

/**
 * 数据库注册表
 * 统一管理所有数据库的配置信息
 */
export class DatabaseRegistry {
    private static configs = new Map<DB_NAME, DatabaseConfig>();

    /**
     * 注册数据库配置
     * @param name 数据库名称
     * @param config 数据库配置
     */
    static register(name: DB_NAME, config: DatabaseConfig): void {
        this.configs.set(name, config);
    }

    /**
     * 获取数据库配置
     * @param name 数据库名称
     * @returns 数据库配置
     * @throws 如果数据库未注册则抛出错误
     */
    static getConfig(name: DB_NAME): DatabaseConfig {
        const config = this.configs.get(name);
        if (!config) {
            throw new Error(`Database ${name} not registered`);
        }
        return config;
    }

    /**
     * 获取所有已注册的数据库名称
     * @returns 数据库名称数组
     */
    static getAllNames(): DB_NAME[] {
        return Array.from(this.configs.keys());
    }

    /**
     * 检查数据库是否已注册
     * @param name 数据库名称
     * @returns 是否已注册
     */
    static isRegistered(name: DB_NAME): boolean {
        return this.configs.has(name);
    }
}

