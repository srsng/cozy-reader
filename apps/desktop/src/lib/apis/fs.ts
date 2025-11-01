import { invoke } from '$lib/backend/ipc';

export async function exists(params: { path: string }) {
    return await invoke<boolean>('fs_exists', params);
}

export async function read_file_to_string(params: { path: string }) {
    return await invoke<string>('read_file_to_string', params);
}
