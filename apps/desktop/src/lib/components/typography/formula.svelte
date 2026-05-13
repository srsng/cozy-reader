<script lang="ts">
    import { onMount } from 'svelte';
    import { renderRatexToCanvas } from '$lib/components/reader/markdown/ratex';
    import { normalizeRatexLatex } from './formula-utils';

    interface Props {
        raw?: string;
        text: string;
        displayMode?: boolean;
    }

    const { text, displayMode = false }: Props = $props();

    const fontSize = $derived(displayMode ? 26 : 18);
    const padding = $derived(displayMode ? 10 : 2);
    const latex = $derived(normalizeRatexLatex(text));

    let containerElement: HTMLElement | null = $state(null);
    let canvasElement: HTMLCanvasElement | null = $state(null);
    let colorContext: CanvasRenderingContext2D | null = null;
    let renderFrame = 0;
    let delayedRenderTimeout: ReturnType<typeof setTimeout> | null = null;

    function componentToHex(value: number) {
        return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
    }

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

        const observer = new MutationObserver(() => {
            scheduleThemeSync();
        });

        observer.observe(document.documentElement, {
            attributes: true
        });

        if (document.body) {
            observer.observe(document.body, {
                attributes: true
            });
        }

        return () => {
            observer.disconnect();
            if (renderFrame) {
                cancelAnimationFrame(renderFrame);
            }
            if (delayedRenderTimeout) {
                clearTimeout(delayedRenderTimeout);
            }
        };
    });
</script>

{#if displayMode}
    <div bind:this={containerElement} class="my-6 overflow-x-auto text-center">
        <canvas
            bind:this={canvasElement}
            class="mx-auto inline-block max-w-full align-middle"
            aria-label={latex}
        ></canvas>
    </div>
{:else}
    <span bind:this={containerElement} class="mx-0.5 inline-block max-w-full align-middle">
        <canvas bind:this={canvasElement} class="inline-block align-middle" aria-label={latex}
        ></canvas>
    </span>
{/if}
