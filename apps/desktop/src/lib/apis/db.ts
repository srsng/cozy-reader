import { invoke } from '$lib/backend/ipc';
import type { DatabaseConfig } from '$lib/database';

export async function getDatabaseConfigs(): Promise<DatabaseConfig[]> {
    return await invoke<DatabaseConfig[]>('get_database_configs')
}