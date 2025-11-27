import Database from '@tauri-apps/plugin-sql';
import type { DB_NAME } from './const';
import { DatabaseRegistry } from './registry';

/**
 * 多数据库连接管理器
 * 负责管理多个数据库连接的生命周期，包括连接创建、健康检查、重连等
 */
export class DatabaseManager {
    private static instance: DatabaseManager;
    private connections = new Map<DB_NAME, Database>();

    private constructor() {
        // 私有构造函数，确保单例模式
    }

    /**
     * 获取 DatabaseManager 单例实例
     * @returns DatabaseManager 实例
     */
    static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    /**
     * 获取数据库连接
     * 如果连接不存在或已断开，会自动创建新连接
     * @param name 数据库名称
     * @returns 数据库连接实例
     */
    async getDatabase(name: DB_NAME): Promise<Database> {
        let db = this.connections.get(name);
        if (!db || !(await this.isConnectionHealthy(name, db))) {
            await this.closeDatabase(name);
            db = await this.createConnection(name);
            this.connections.set(name, db);
        }
        return db;
    }

    /**
     * 检查数据库连接是否健康
     * @param name 数据库名称
     * @param db 数据库连接实例
     * @returns 连接是否健康
     */
    private async isConnectionHealthy(name: DB_NAME, db: Database): Promise<boolean> {
        try {
            await db.execute('SELECT 1');
            return true;
        } catch (error) {
            console.warn(`Database ${name} connection health check failed:`, error);
            return false;
        }
    }

    /**
     * 创建数据库连接
     * @param name 数据库名称
     * @returns 数据库连接实例
     */
    private async createConnection(name: DB_NAME): Promise<Database> {
        const config = DatabaseRegistry.getConfig(name);
        const db = await Database.load(`sqlite:${config.filename}`);

        // 启用 WAL 模式以提高并发性能
        if (config.wal) {
            await db.execute('PRAGMA journal_mode=WAL;');
        }

        // 启用外键约束
        await db.execute('PRAGMA foreign_keys=ON;');

        return db;
    }

    /**
     * 关闭指定数据库连接
     * @param name 数据库名称
     */
    async closeDatabase(name: DB_NAME): Promise<void> {
        const db = this.connections.get(name);
        if (db) {
            try {
                await db.close();
            } catch (error) {
                console.error(`Failed to close database ${name}:`, error);
            } finally {
                this.connections.delete(name);
            }
        }
    }

    /**
     * 关闭所有数据库连接
     */
    async closeAll(): Promise<void> {
        const names = Array.from(this.connections.keys());
        for (const name of names) {
            await this.closeDatabase(name);
        }
    }

    /**
     * 检查数据库连接是否存在
     * @param name 数据库名称
     * @returns 连接是否存在
     */
    isConnected(name: DB_NAME): boolean {
        return this.connections.has(name);
    }

    /**
     * 获取所有已连接的数据库名称
     * @returns 数据库名称数组
     */
    getConnectedDatabases(): DB_NAME[] {
        return Array.from(this.connections.keys());
    }
}

