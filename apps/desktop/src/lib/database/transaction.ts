import type Database from '@tauri-apps/plugin-sql';
import type { DB_NAME } from './const';
import { DatabaseManager } from './manager';

/**
 * 数据库事务类
 * 提供单数据库事务管理功能
 */
export class Transaction {
    constructor(
        private db: Database,
        public readonly dbName: DB_NAME
    ) { }

    /**
     * 获取底层数据库连接
     */
    get database(): Database {
        return this.db;
    }

    /**
     * 执行事务
     * @param dbName 数据库名称
     * @param callback 事务回调函数
     * @returns 事务执行结果
     */
    static async run<T>(
        dbName: DB_NAME,
        callback: (tx: Transaction) => Promise<T>
    ): Promise<T> {
        const manager = DatabaseManager.getInstance();
        const db = await manager.getDatabase(dbName);

        await db.execute('BEGIN TRANSACTION');

        try {
            const tx = new Transaction(db, dbName);
            const result = await callback(tx);
            await db.execute('COMMIT');
            return result;
        } catch (error) {
            await db.execute('ROLLBACK');
            throw error;
        }
    }

    /**
     * 创建保存点（用于嵌套事务）
     * @param savepointName 保存点名称
     */
    async createSavepoint(savepointName: string): Promise<void> {
        await this.db.execute(`SAVEPOINT ${savepointName}`);
    }

    /**
     * 回滚到保存点
     * @param savepointName 保存点名称
     */
    async rollbackToSavepoint(savepointName: string): Promise<void> {
        await this.db.execute(`ROLLBACK TO SAVEPOINT ${savepointName}`);
    }

    /**
     * 释放保存点
     * @param savepointName 保存点名称
     */
    async releaseSavepoint(savepointName: string): Promise<void> {
        await this.db.execute(`RELEASE SAVEPOINT ${savepointName}`);
    }
}

/**
 * 跨数据库事务管理器
 * 使用两阶段提交实现跨数据库事务
 */
export class MultiDatabaseTransaction {
    /**
     * 执行跨数据库事务
     * @param dbNames 参与的数据库名称数组
     * @param callback 事务回调函数
     * @returns 事务执行结果
     */
    static async run<T>(
        dbNames: DB_NAME[],
        callback: (tx_map: Map<DB_NAME, Transaction>) => Promise<T>
    ): Promise<T> {
        const manager = DatabaseManager.getInstance();
        const tx_map = new Map<DB_NAME, Transaction>();

        // 阶段1：准备所有事务
        try {
            for (const dbName of dbNames) {
                const db = await manager.getDatabase(dbName);
                await db.execute('BEGIN TRANSACTION');
                tx_map.set(dbName, new Transaction(db, dbName));
            }

            const result = await callback(tx_map);

            // 阶段2：提交所有事务
            for (const dbName of dbNames) {
                const db = await manager.getDatabase(dbName);
                await db.execute('COMMIT');
            }

            return result;
        } catch (error) {
            // 回滚所有事务
            for (const dbName of dbNames) {
                try {
                    const db = await manager.getDatabase(dbName);
                    await db.execute('ROLLBACK');
                } catch (rollbackError) {
                    console.error(`Failed to rollback ${dbName}:`, rollbackError);
                }
            }
            throw error;
        }
    }
}

