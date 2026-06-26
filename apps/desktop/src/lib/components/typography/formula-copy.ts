import { writeToClipBoard } from '$lib/utils/clip';

export type ClipboardWriter = (text: string, toastIt?: boolean) => Promise<boolean>;

export function isFormulaCopyActivationKey(key: string): boolean {
    return key === 'Enter' || key === ' ' || key === 'Spacebar';
}

export function copyFormulaToClipboard(
    text: string,
    write: ClipboardWriter = writeToClipBoard
): Promise<boolean> {
    return write(text, true);
}
