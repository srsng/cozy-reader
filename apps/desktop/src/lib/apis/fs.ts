import { invoke } from '$lib/backend/ipc';
import type { FileInfo } from '$lib/backend/types/FileInfo';

export async function exists(params: { path: string }) {
    return await invoke<boolean>('fs_exists', params);
}

export async function read_file_to_string(params: { path: string }) {
    return await invoke<string>('read_file_to_string', params);
}

export async function getFileInfo(path: string): Promise<FileInfo> {
    return await invoke<FileInfo>('get_file_info', { path });
}
