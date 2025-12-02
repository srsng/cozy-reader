import Database from '@tauri-apps/plugin-sql';
import { DatabaseRegistry } from './registry';
import type { DatabaseConfig, DatabaseName } from '../types';

export class DatabaseManager {
    private static instance: DatabaseManager;
    private connections = new Map<DatabaseName, Database>();
    private registry = DatabaseRegistry.getInstance();
    private registryInitialized = false;

    private constructor() { }

    static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    /**
     * 创建数据库连接
     */
    private async createConnection(config: DatabaseConfig): Promise<Database> {
        const db = await Database.load(`sqlite:${config.filename}`);

        if (config.wal) {
            await db.execute('PRAGMA journal_mode=WAL;');
        }
        await db.execute('PRAGMA foreign_keys=ON;');

        return db;
    }

    /**
     * 检查连接是否健康
     */
    private async isConnectionHealthy(db: Database): Promise<boolean> {
        try {
            await db.execute('SELECT 1');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 初始化（仅确保注册表已初始化，不创建连接）
     * 注意：迁移由 Rust 后端通过 tauri_plugin_sql 自动处理
     */
    async initialize(): Promise<void> {
        if (this.registryInitialized) return;

        // 确保注册表已初始化
        if (!this.registry.isInitialized()) {
            await this.registry.initialize();
        }

        this.registryInitialized = true;
    }

    /**
     * 获取数据库连接（按需创建）
     */
    async getDatabase(name: DatabaseName): Promise<Database> {
        // 确保注册表已初始化
        if (!this.registryInitialized) {
            await this.initialize();
        }

        let db = this.connections.get(name);

        // 如果连接不存在或不健康，创建新连接
        if (!db || !(await this.isConnectionHealthy(db))) {
            if (db) {
                await this.closeDatabase(name);
            }
            const config = this.registry.getConfig(name);
            db = await this.createConnection(config);
            this.connections.set(name, db);
        }

        return db;
    }

    /**
     * 检查数据库是否已连接
     */
    isConnected(name: DatabaseName): boolean {
        return this.connections.has(name);
    }

    /**
     * 获取所有已连接的数据库名称
     */
    getConnectedDatabases(): DatabaseName[] {
        return Array.from(this.connections.keys());
    }

    /**
     * 关闭指定数据库连接
     */
    async closeDatabase(name: DatabaseName): Promise<void> {
        const db = this.connections.get(name);
        if (db) {
            await db.close();
            this.connections.delete(name);
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
}
