<script lang="ts">
    import { onMount } from 'svelte';
    import type { Position } from '$lib/reader/utils/sel';

    interface Props {
        width: number;
        height?: number;
        minHeight?: number;
        maxHeight?: number;
        position?: Position;
        trianglePosition?: Position;
        className?: string;
        triangleClassName?: string;
        additionalStyle?: Record<string, string>;
        isOpen?: boolean;
        onDismiss?: () => void;
        children?: import('svelte').Snippet;
    }

    const {
        width,
        height,
        minHeight,
        maxHeight,
        position,
        trianglePosition,
        className = '',
        triangleClassName = '',
        additionalStyle = {},
        isOpen = true,
        onDismiss,
        children
    }: Props = $props();

    let containerRef: HTMLDivElement | null = $state(null);
    let adjustedPosition = $state(position);
    let childrenHeight = $state(height || minHeight || 0);

    const popupPadding = 10;
    let availableHeight = window.innerHeight - 2 * popupPadding;
    if (trianglePosition?.dir === 'up') {
        availableHeight = trianglePosition.point.y - popupPadding;
    } else if (trianglePosition?.dir === 'down') {
        availableHeight = window.innerHeight - trianglePosition.point.y - popupPadding;
    }
    const maxHeightValue = Math.min(maxHeight || availableHeight, availableHeight);
    const minHeightValue = minHeight ? Math.min(minHeight, availableHeight) : undefined;

    $effect(() => {
        if (!containerRef) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const newHeight = entry.contentRect.height;
                if (newHeight !== childrenHeight) {
                    childrenHeight = newHeight;
                    return;
                }
            }
        });

        resizeObserver.observe(containerRef);
        return () => {
            resizeObserver.disconnect();
        };
    });

    $effect(() => {
        if (!containerRef) return;
        if (!position || !trianglePosition || position.dir !== 'up') {
            adjustedPosition = position;
            return;
        }
        const containerHeight = childrenHeight || containerRef.offsetHeight;
        adjustedPosition = {
            ...position,
            point: {
                ...position.point,
                y: trianglePosition.point.y - containerHeight
            }
        };
    });

    // 处理键盘事件
    $effect(() => {
        if (!isOpen || !onDismiss) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onDismiss();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });
</script>

<div>
    <div
        bind:this={containerRef}
        id="popup-container"
        class="absolute rounded-lg font-sans {trianglePosition?.dir !== 'up'
            ? 'shadow-xl'
            : ''} {className}"
        style="width: {width}px; {height ? `height: ${height}px;` : ''} {minHeightValue
            ? `min-height: ${minHeightValue}px;`
            : ''} {maxHeightValue ? `max-height: ${maxHeightValue}px;` : ''} left: {adjustedPosition
            ? adjustedPosition.point.x
            : -999}px; top: {adjustedPosition ? adjustedPosition.point.y : -999}px; {Object.entries(
            additionalStyle
        )
            .map(([k, v]) => `${k}: ${v};`)
            .join(' ')}"
    >
        {@render children?.()}
    </div>
    <div
        class="absolute {triangleClassName}"
        style="left: {trianglePosition?.dir === 'left' || trianglePosition?.dir === 'right'
            ? trianglePosition.point.x
            : trianglePosition
              ? trianglePosition.point.x
              : -999}px; top: {trianglePosition?.dir === 'up' || trianglePosition?.dir === 'down'
            ? trianglePosition.point.y
            : trianglePosition
              ? trianglePosition.point.y
              : -999}px; border-left: {trianglePosition?.dir === 'right'
            ? 'none'
            : trianglePosition?.dir === 'left'
              ? '7px solid'
              : '7px solid transparent'}; border-right: {trianglePosition?.dir === 'left'
            ? 'none'
            : trianglePosition?.dir === 'right'
              ? '7px solid'
              : '7px solid transparent'}; border-top: {trianglePosition?.dir === 'down'
            ? 'none'
            : trianglePosition?.dir === 'up'
              ? '7px solid'
              : '7px solid transparent'}; border-bottom: {trianglePosition?.dir === 'up'
            ? 'none'
            : trianglePosition?.dir === 'down'
              ? '7px solid'
              : '7px solid transparent'}; transform: {trianglePosition?.dir === 'left' ||
        trianglePosition?.dir === 'right'
            ? 'translateY(-50%)'
            : 'translateX(-50%)'};"
    ></div>
</div>

<style>
    .triangle {
        width: 0;
        height: 0;
    }
</style>
