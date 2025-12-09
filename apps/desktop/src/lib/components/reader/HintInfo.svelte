<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { Insets } from '$lib/reader/utils/insets';

    interface Props {
        bookKey: string;
        showDoubleBorder: boolean;
        isScrolled: boolean;
        isVertical: boolean;
        horizontalGap: number;
        contentInsets: Insets;
        gridInsets: Insets;
    }

    const {
        bookKey,
        showDoubleBorder,
        isScrolled,
        isVertical,
        horizontalGap,
        contentInsets,
        gridInsets
    }: Props = $props();

    let hintMessage = $state<string | null>(null);
    let hintTimeout = $state(2000);
    let dismissTimeout: ReturnType<typeof setTimeout> | null = null;

    const topInset = $derived(Math.max(gridInsets.top, 0));
    const isEink = $derived(false); // TODO: 从设置中获取

    const handleShowHint = (event: CustomEvent) => {
        const { message, bookKey: hintBookKey, timeout = 2000 } = event.detail;
        if (hintBookKey !== bookKey) return;
        hintMessage = message;
        hintTimeout = timeout;
    };

    $effect(() => {
        if (dismissTimeout) clearTimeout(dismissTimeout);
        if (hintMessage) {
            dismissTimeout = setTimeout(() => {
                hintMessage = null;
            }, hintTimeout);
        }
        return () => {
            if (dismissTimeout) clearTimeout(dismissTimeout);
        };
    });

    onMount(() => {
        const handler = handleShowHint as EventListener;
        window.addEventListener('hint', handler);
        return () => {
            window.removeEventListener('hint', handler);
        };
    });
</script>

{#if hintMessage}
    <div class="absolute left-0 right-0 top-0 z-10" style="height: {topInset}px;"></div>
    <div
        class="hintinfo absolute flex items-center justify-end overflow-hidden ps-2 {isVertical
            ? 'writing-vertical-rl'
            : 'top-0 h-[44px]'} {isScrolled
            ? isVertical
                ? 'h-full'
                : 'w-full'
            : isVertical
              ? 'max-h-[50%]'
              : 'max-w-[50%]'}"
        style={isVertical
            ? `bottom: ${contentInsets.bottom * 1.5}px; right: ${
                  showDoubleBorder
                      ? `calc(${contentInsets.right}px)`
                      : `calc(${Math.max(0, contentInsets.right - 32)}px)`
              }; width: ${showDoubleBorder ? '30px' : `${horizontalGap}%`};`
            : `top: ${topInset}px; inset-inline-end: calc(${horizontalGap / 2}% + ${contentInsets.right}px);`}
    >
        <h2
            class="text-center font-sans {isEink
                ? 'text-sm font-normal'
                : 'text-neutral-content text-xs font-light'}"
        >
            {hintMessage || ''}
        </h2>
    </div>
{/if}
