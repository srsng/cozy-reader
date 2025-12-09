<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { bookDataStore } from '$lib/reader/stores/bookDataStore';
    import { useFoliateEvents } from '$lib/reader/hooks/useFoliateEvents.svelte';
    import { getPopupPosition, getPosition, type Position } from '$lib/reader/utils/sel';
    import Popup from './annotator/Popup.svelte';
    import type { BookDoc, FoliateViewElement } from '$lib/reader/types';

    interface Props {
        bookKey: string;
        bookDoc: BookDoc;
    }

    const { bookKey, bookDoc }: Props = $props();

    const view = $derived(readerStore.getView(bookKey));
    const readerSettings = $derived(readerStore.getReaderSettings(bookKey));

    const popupWidth = 360;
    const popupHeight = 88;
    const popupPadding = 10;

    let containerRef: HTMLDivElement | null = $state(null);
    let footnoteRef: HTMLDivElement | null = $state(null);
    let footnoteViewRef: FoliateViewElement | null = $state(null);
    let trianglePosition = $state<Position | null>(null);
    let popupPosition = $state<Position | null>(null);
    let showPopup = $state(false);
    let gridRect = $state<DOMRect | null>(null);
    let responsiveWidth = $state(popupWidth);
    let responsiveHeight = $state(popupHeight);

    const getResponsivePopupSize = (size: number, isVertical: boolean) => {
        const maxSize = isVertical ? window.innerWidth / 2 : window.innerHeight / 2;
        return Math.min(size, maxSize - popupPadding - 12);
    };

    const closePopup = () => {
        if (footnoteViewRef) {
            footnoteViewRef.close();
            footnoteViewRef.remove();
            footnoteViewRef = null;
        }
    };

    const handleDismissPopup = () => {
        closePopup();
        gridRect = null;
        popupPosition = null;
        trianglePosition = null;
        showPopup = false;
    };

    const docLinkHandler = async (event: Event) => {
        const detail = (event as CustomEvent).detail;
        const gridFrame = document.querySelector(`#gridcell-${bookKey}`);
        if (!gridFrame || !readerSettings) return;
        const rect = gridFrame.getBoundingClientRect();
        const triangPos = getPosition(detail.a, rect, popupPadding, readerSettings.vertical);
        gridRect = rect;
        trianglePosition = triangPos;

        // TODO: 处理脚注链接
        const { a: anchor } = detail as { a: HTMLAnchorElement };
        const footnoteClasses = ['duokan-footnote', 'footnote-link', 'footnote'];
        if (footnoteClasses.some((cls) => anchor.classList.contains(cls))) {
            detail['follow'] = true;
        }
        // TODO: 使用 FootnoteHandler 处理脚注
    };

    // 监听响应式尺寸变化
    $effect(() => {
        if (readerSettings) {
            if (readerSettings.vertical) {
                responsiveWidth = popupHeight;
                responsiveHeight = Math.max(popupWidth, window.innerHeight / 4);
            } else {
                responsiveWidth = Math.max(popupWidth, window.innerWidth / 4);
                responsiveHeight = popupHeight;
            }
        }
    });

    // 更新弹窗位置
    $effect(() => {
        if (trianglePosition && gridRect && readerSettings) {
            const popupPos = getPopupPosition(
                trianglePosition,
                gridRect,
                responsiveWidth,
                responsiveHeight,
                popupPadding
            );
            popupPosition = popupPos;
        }
    });

    // 处理脚注弹窗事件
    const handleFootnotePopupEvent = (event: CustomEvent) => {
        const { element, footnote } = event.detail;
        const gridFrame = document.querySelector(`#gridcell-${bookKey}`);
        if (!gridFrame || !readerSettings || !footnoteRef) return;
        const rect = gridFrame.getBoundingClientRect();
        const triangPos = getPosition(element, rect, popupPadding, readerSettings.vertical);

        const elem = document.createElement('p');
        elem.textContent = footnote;
        elem.setAttribute('style', 'padding: 1em; hanging-punctuation: allow-end last;');
        elem.style.visibility = 'hidden';
        if (readerSettings.vertical) {
            elem.style.height = `${responsiveHeight}px`;
        } else {
            elem.style.width = `${responsiveWidth}px`;
        }
        document.body.appendChild(elem);
        const popupSize = elem.getBoundingClientRect();
        if (readerSettings.vertical) {
            responsiveWidth = getResponsivePopupSize(popupSize.width, true);
        } else {
            responsiveHeight = getResponsivePopupSize(popupSize.height, false);
        }
        document.body.removeChild(elem);

        elem.style.visibility = 'visible';
        footnoteRef.replaceChildren(elem);
        gridRect = rect;
        trianglePosition = triangPos;
        showPopup = true;
    };

    // 使用 $effect 来管理 foliate 事件
    $effect(() => {
        return useFoliateEvents(view, {
            onLinkClick: docLinkHandler
        });
    });

    onMount(() => {
        window.addEventListener('resize', handleDismissPopup);
        window.addEventListener('footnote-popup', handleFootnotePopupEvent as EventListener);
        return () => {
            window.removeEventListener('resize', handleDismissPopup);
            window.removeEventListener('footnote-popup', handleFootnotePopupEvent as EventListener);
        };
    });
</script>

<div bind:this={containerRef} role="toolbar" tabindex="-1">
    {#if showPopup && trianglePosition && popupPosition}
        <!-- TODO: 添加 Overlay 组件 -->
        <Popup
            isOpen={showPopup}
            width={responsiveWidth}
            height={responsiveHeight}
            position={popupPosition}
            {trianglePosition}
            className="select-text overflow-y-auto"
            onDismiss={handleDismissPopup}
        >
            <div
                bind:this={footnoteRef}
                style="width: {responsiveWidth}px; height: {responsiveHeight}px;"
            ></div>
        </Popup>
    {/if}
</div>
