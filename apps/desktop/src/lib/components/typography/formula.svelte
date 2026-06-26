<script lang="ts" module>
    import { onMount } from 'svelte';
    import { renderRatexToCanvas } from '$lib/components/reader/markdown/ratex';
    import { normalizeRatexLatex } from './formula-utils';
    import { isSelectionIntersectingNode } from './formula-selection';
    import { copyFormulaToClipboard, isFormulaCopyActivationKey } from './formula-copy';

    interface Props {
        raw?: string;
        text: string;
        displayMode?: boolean;
    }

    function componentToHex(value: number) {
        return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
    }
</script>

<script lang="ts">
    const { raw = '', text, displayMode = false }: Props = $props();

    const fontSize = $derived(displayMode ? 26 : 18);
    const padding = $derived(displayMode ? 10 : 2);
    const latex = $derived(normalizeRatexLatex(text));
    const copyText = $derived(raw.trim() || text.trim());

    let containerElement: HTMLElement | null = $state(null);
    let canvasElement: HTMLCanvasElement | null = $state(null);
    let hasFocus = $state(false);
    let isSelected = $state(false);
    let colorContext: CanvasRenderingContext2D | null = null;
    let renderFrame = 0;
    let delayedRenderTimeout: ReturnType<typeof setTimeout> | null = null;

    function getColorContext() {
        if (colorContext || typeof document === 'undefined') {
            return colorContext;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        colorContext = canvas.getContext('2d', { willReadFrequently: true });
        return colorContext;
    }

    function normalizeRatexColor(value: string): string {
        const trimmed = value.trim();

        if (!trimmed) {
            return '#000000';
        }

        if (trimmed.startsWith('#')) {
            return trimmed;
        }

        const context = getColorContext();

        if (context) {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = '#000000';
            context.fillStyle = trimmed;
            context.fillRect(0, 0, 1, 1);

            const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
            return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
        }

        return '#000000';
    }

    async function renderFormula() {
        if (!canvasElement || !containerElement) {
            return;
        }

        try {
            const color = normalizeRatexColor(getComputedStyle(containerElement).color);

            await renderRatexToCanvas(
                latex,
                canvasElement,
                {
                    fontSize,
                    padding,
                    backgroundColor: 'transparent'
                },
                color
            );
        } catch (error) {
            canvasElement.width = 0;
            canvasElement.height = 0;
            console.error(`[ratex-formula] latex=${JSON.stringify(latex.slice(0, 80))}`, error);
        }
    }

    function scheduleRender(frameCount = 1) {
        if (renderFrame) {
            cancelAnimationFrame(renderFrame);
            renderFrame = 0;
        }

        const step = (remaining: number) => {
            renderFrame = requestAnimationFrame(() => {
                if (remaining <= 1) {
                    renderFrame = 0;
                    void renderFormula();
                    return;
                }

                step(remaining - 1);
            });
        };

        step(Math.max(1, frameCount));
    }

    function scheduleThemeSync() {
        scheduleRender(2);

        if (delayedRenderTimeout) {
            clearTimeout(delayedRenderTimeout);
        }

        delayedRenderTimeout = setTimeout(() => {
            delayedRenderTimeout = null;
            scheduleRender(1);
        }, 80);
    }

    $effect(() => {
        latex;
        fontSize;
        padding;
        if (canvasElement && containerElement) {
            scheduleRender(1);
        }
    });

    onMount(() => {
        scheduleThemeSync();
        syncSelectedState();

        const handleSelectionChange = () => {
            syncSelectedState();
        };

        const observer = new MutationObserver(() => {
            scheduleThemeSync();
        });

        document.addEventListener('selectionchange', handleSelectionChange);
        observer.observe(document.documentElement, {
            attributes: true
        });

        if (document.body) {
            observer.observe(document.body, {
                attributes: true
            });
        }

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            observer.disconnect();
            if (renderFrame) {
                cancelAnimationFrame(renderFrame);
            }
            if (delayedRenderTimeout) {
                clearTimeout(delayedRenderTimeout);
            }
        };
    });

    function handleFormulaCopy(event: ClipboardEvent) {
        const selection = document.getSelection();

        if (selection && !selection.isCollapsed) {
            return;
        }

        if (!event.clipboardData) {
            return;
        }

        event.clipboardData.setData('text/plain', copyText);
        event.preventDefault();
    }

    function handleFormulaClick() {
        void copyFormulaToClipboard(copyText);
    }

    function handleFormulaKeydown(event: KeyboardEvent) {
        if (!isFormulaCopyActivationKey(event.key)) {
            return;
        }

        event.preventDefault();
        void copyFormulaToClipboard(copyText);
    }

    function syncSelectedState() {
        isSelected =
            hasFocus || isSelectionIntersectingNode(document.getSelection(), containerElement);
    }

    function handleFocus() {
        hasFocus = true;
        syncSelectedState();
    }

    function handleBlur() {
        hasFocus = false;
        syncSelectedState();
    }
</script>

{#if displayMode}
    <div
        bind:this={containerElement}
        class="focus-visible:ring-ring/50 data-[selected=true]:bg-primary/10 data-[selected=true]:ring-primary/25 my-6 overflow-x-auto rounded-sm text-center outline-none transition-colors focus-visible:ring-2 data-[selected=true]:ring-2"
        tabindex="0"
        role="button"
        aria-label={`复制公式：${latex}`}
        data-selected={isSelected ? 'true' : undefined}
        data-markdown-copy-text={copyText}
        onclick={handleFormulaClick}
        onkeydown={handleFormulaKeydown}
        oncopy={handleFormulaCopy}
        onfocus={handleFocus}
        onblur={handleBlur}
    >
        <canvas
            bind:this={canvasElement}
            class="mx-auto inline-block max-w-full align-middle"
            aria-hidden="true"
        ></canvas>
    </div>
{:else}
    <span
        bind:this={containerElement}
        class="focus-visible:ring-ring/50 data-[selected=true]:bg-primary/10 data-[selected=true]:ring-primary/25 mx-0.5 inline-block max-w-full rounded-sm align-middle outline-none transition-colors focus-visible:ring-2 data-[selected=true]:ring-2"
        tabindex="0"
        role="button"
        aria-label={`复制公式：${latex}`}
        data-selected={isSelected ? 'true' : undefined}
        data-markdown-copy-text={copyText}
        onclick={handleFormulaClick}
        onkeydown={handleFormulaKeydown}
        oncopy={handleFormulaCopy}
        onfocus={handleFocus}
        onblur={handleBlur}
    >
        <canvas bind:this={canvasElement} class="inline-block align-middle" aria-hidden="true"
        ></canvas>
    </span>
{/if}
