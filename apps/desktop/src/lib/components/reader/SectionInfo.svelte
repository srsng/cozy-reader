<script lang="ts">
    import { readerStore } from '$lib/reader/stores/readerStore';
    import type { Insets } from '$lib/reader/utils/insets';

    interface Props {
        bookKey: string;
        section?: string;
        showDoubleBorder: boolean;
        isScrolled: boolean;
        isVertical: boolean;
        horizontalGap: number;
        contentInsets: Insets;
        gridInsets: Insets;
    }

    const {
        bookKey,
        section,
        showDoubleBorder,
        isScrolled,
        isVertical,
        horizontalGap,
        contentInsets,
        gridInsets
    }: Props = $props();

    const hoveredBookKey = $derived(readerStore.getHoveredBookKey());
    const topInset = $derived(Math.max(gridInsets.top, 0));
    const isEink = $derived(false); // TODO: 从设置中获取
</script>

<div
    class="absolute left-0 right-0 top-0 z-10 {isScrolled && !isVertical ? 'bg-base-100' : ''}"
    style="height: {topInset}px;"
></div>

<div
    class="sectioninfo absolute flex items-center overflow-hidden font-sans {isEink
        ? 'text-sm font-normal'
        : 'text-neutral-content text-xs font-light'} {isVertical
        ? 'writing-vertical-rl max-h-[85%]'
        : 'top-0 h-[44px]'} {isScrolled && !isVertical ? 'bg-base-100' : ''}"
    role="none"
    onclick={() => readerStore.setHoveredBookKey(bookKey)}
    style={isVertical
        ? `top: ${contentInsets.top * 1.5}px; right: ${
              showDoubleBorder
                  ? `calc(${contentInsets.right}px)`
                  : `calc(${Math.max(0, contentInsets.right - 32)}px)`
          }; width: ${
              showDoubleBorder ? '32px' : `${horizontalGap}%`
          }; height: calc(100% - ${contentInsets.top + contentInsets.bottom}px);`
        : `top: ${topInset}px; padding-inline: calc(${horizontalGap / 2}% + ${contentInsets.left}px); width: 100%;`}
>
    <span
        aria-label={section ? `章节标题: ${section}` : ''}
        class="text-center {isVertical ? '' : 'line-clamp-1'} {!isVertical &&
        hoveredBookKey === bookKey
            ? 'hidden'
            : ''}"
    >
        {section || ''}
    </span>
</div>
