/**
 * Tauri 命令调用封装
 */

import { invoke } from '@tauri-apps/api/core';
import type { DatabaseConfig } from '.';

/**
 * 获取所有数据库配置
 */
export async function getDatabaseConfigs(): Promise<DatabaseConfig[]> {
    return await invoke<DatabaseConfig[]>('get_database_configs');
}
