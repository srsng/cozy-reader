import type { BookDoc } from '../types';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';

    for (let index = 0; index < bytes.length; index += chunkSize) {
        const chunk = bytes.subarray(index, index + chunkSize);
        binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
    const mimeType = blob.type || 'image/png';
    const base64Data = arrayBufferToBase64(await blob.arrayBuffer());
    return `data:${mimeType};base64,${base64Data}`;
}

export async function extractCoverDataUrl(
    bookDoc: Pick<BookDoc, 'getCover'>
): Promise<string | null> {
    const coverBlob = await bookDoc.getCover();
    return coverBlob ? await blobToDataUrl(coverBlob) : null;
}
