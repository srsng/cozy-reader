// from gitbulter
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { toast } from 'svelte-sonner';

/**
 * Copy the provided text into the the system clipboard. Upon completion, a toast will be displayed which contains
 * information about the success of this operation.
 *
 * @param text text to be copied into the system clipboard.
 * @param errorMessage optional custom error message which will be displayed if the operation failes. If this is
 *                     not provided, a default generic message will be used.
 */
export async function writeClipboard(
    text: string,
    opt: {
        errorMessage?: string;
        message?: string;
        description?: string;
        errorDescription?: string;
    } = {}
) {
    const { errorMessage, message } = opt;
    await writeText(text)
        .then(() => {
            toast.info(message || 'Copied to clipboard', {
                description: opt.description
            });
        })
        .catch((err: any) => {
            toast.error(errorMessage || 'Failed to copy', {
                description: opt.errorDescription
            });
            console.error(errorMessage, err);
        });
}

export async function readClipboard() {
    return await readText();
}
