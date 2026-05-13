import 'ratex-wasm/fonts.css';

import {
    initRatex,
    renderLatexToDisplayList,
    renderToCanvas,
    type DisplayList,
    type WebRenderOptions
} from 'ratex-wasm';

let ratexReadyPromise: Promise<void> | null = null;

export async function ensureRatexReady(): Promise<void> {
    if (!ratexReadyPromise) {
        ratexReadyPromise = initRatex();
    }

    try {
        await ratexReadyPromise;
    } catch (error) {
        ratexReadyPromise = null;
        throw error;
    }
}

export async function renderRatexToCanvas(
    latex: string,
    canvas: HTMLCanvasElement,
    options: WebRenderOptions,
    color?: string
): Promise<DisplayList> {
    await ensureRatexReady();
    const displayList = renderLatexToDisplayList(latex, color);
    renderToCanvas(displayList, canvas, options);
    return displayList;
}
