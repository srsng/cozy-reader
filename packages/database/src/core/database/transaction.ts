/**
 * 单数据库事务管理
 */

import Database from '@tauri-apps/plugin-sql';
import { DatabaseError } from '../errors';
import { logDatabaseError } from '../logging';

/**
 * 事务类
 * 提供单数据库事务管理功能
 */
export class Transaction {
    private savepoints: string[] = [];
    private savepointCounter: number = 0;

    constructor(private db: Database) { }

    /**
     * 执行事务
     * @param callback 事务回调函数，返回事务结果
     */
    async run<T>(callback: (db: Database) => Promise<T>): Promise<T> {
        await this.db.execute('BEGIN TRANSACTION');

        try {
            const result = await callback(this.db);
            await this.db.execute('COMMIT');
            return result;
        } catch (error) {
            // 捕获ROLLBACK失败，记录错误但不覆盖原始错误
            try {
                await this.db.execute('ROLLBACK');
            } catch (rollbackError) {
                logDatabaseError('Failed to rollback transaction:', rollbackError);
                // 不覆盖原始错误，只是记录回滚失败
            }

            // 确保原始错误信息不丢失
            const originalError = error instanceof Error
                ? error
                : new Error(String(error));

            throw new DatabaseError(
                `Transaction failed: ${originalError.message}`,
                'TRANSACTION_FAILED',
                originalError
            );
        }
    }

    /**
     * 创建保存点
     */
    async createSavepoint(name: string): Promise<void> {
        // 使用递增计数器和随机字符串确保唯一性，避免高并发下的命名冲突
        this.savepointCounter++;
        const randomSuffix = Math.random().toString(36).substring(2, 11);
        const savepointName = `sp_${name}_${this.savepointCounter}_${Date.now()}_${randomSuffix}`;
        await this.db.execute(`SAVEPOINT ${savepointName}`);
        this.savepoints.push(savepointName);
    }

    /**
     * 回滚到保存点
     */
    async rollbackToSavepoint(name: string): Promise<void> {
        const savepoint = this.savepoints.find(sp => sp.includes(name));
        if (!savepoint) {
            throw new DatabaseError(`Savepoint ${name} not found`, 'SAVEPOINT_NOT_FOUND');
        }
        await this.db.execute(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    }

    /**
     * 释放保存点
     */
    async releaseSavepoint(name: string): Promise<void> {
        const index = this.savepoints.findIndex(sp => sp.includes(name));
        if (index === -1) {
            throw new DatabaseError(`Savepoint ${name} not found`, 'SAVEPOINT_NOT_FOUND');
        }
        const savepoint = this.savepoints[index];
        await this.db.execute(`RELEASE SAVEPOINT ${savepoint}`);
        this.savepoints.splice(index, 1);
    }
}

/**
 * 创建事务实例
 */
export function createTransaction(db: Database): Transaction {
    return new Transaction(db);
}
