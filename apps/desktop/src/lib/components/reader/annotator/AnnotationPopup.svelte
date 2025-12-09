<script lang="ts">
    import Popup from './Popup.svelte';
    import PopupButton from './PopupButton.svelte';
    import HighlightOptions from './HighlightOptions.svelte';
    import type { Position } from '$lib/reader/utils/sel';
    import type { CommentType } from '@cozy-reader/database';
    import type { Icon } from 'lucide-svelte';

    interface Props {
        dir: 'ltr' | 'rtl';
        isVertical: boolean;
        buttons: Array<{
            tooltipText: string;
            Icon: typeof import('lucide-svelte').Icon;
            onClick: () => void;
            disabled?: boolean;
        }>;
        position: Position;
        trianglePosition: Position;
        highlightOptionsVisible: boolean;
        selectedStyle: CommentType;
        selectedColor: string;
        popupWidth: number;
        popupHeight: number;
        onHighlight: (update?: boolean) => void;
        onDismiss?: () => void;
    }

    const {
        dir,
        isVertical,
        buttons,
        position,
        trianglePosition,
        highlightOptionsVisible,
        selectedStyle,
        selectedColor,
        popupWidth,
        popupHeight,
        onHighlight,
        onDismiss
    }: Props = $props();

    const OPTIONS_HEIGHT_PIX = 28;
    const OPTIONS_PADDING_PIX = 16;
</script>

<div {dir}>
    <Popup
        width={isVertical ? popupHeight : popupWidth}
        height={isVertical ? popupWidth : popupHeight}
        {position}
        {trianglePosition}
        className="selection-popup bg-gray-600 text-white"
        triangleClassName="text-gray-600"
        {onDismiss}
    >
        <div
            class="selection-buttons flex items-center justify-between p-2 {isVertical
                ? 'flex-col'
                : 'flex-row'}"
            style="height: {isVertical ? popupWidth : popupHeight}px;"
        >
            {#each buttons as button}
                <PopupButton
                    showTooltip={!highlightOptionsVisible}
                    tooltipText={button.tooltipText}
                    Icon={button.Icon}
                    onClick={button.onClick}
                    disabled={button.disabled}
                />
            {/each}
        </div>
    </Popup>
    {#if highlightOptionsVisible}
        <HighlightOptions
            {isVertical}
            style={{
                width: `${isVertical ? popupHeight : popupWidth}px`,
                height: `${isVertical ? popupWidth : popupHeight}px`,
                ...(isVertical
                    ? {
                          left: `${
                              position.point.x +
                              (OPTIONS_HEIGHT_PIX + OPTIONS_PADDING_PIX) *
                                  (trianglePosition.dir === 'left' ? -1 : 1)
                          }px`,
                          top: `${position.point.y}px`
                      }
                    : {
                          left: `${position.point.x}px`,
                          top: `${
                              position.point.y +
                              (OPTIONS_HEIGHT_PIX + OPTIONS_PADDING_PIX) *
                                  (trianglePosition.dir === 'up' ? -1 : 1)
                          }px`
                      })
            }}
            {selectedStyle}
            {selectedColor}
            onHandleHighlight={onHighlight}
        />
    {/if}
</div>
