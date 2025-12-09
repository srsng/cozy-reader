<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Copy, Highlighter, SquarePen, Search, Trash2 } from 'lucide-svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { bookDataStore } from '$lib/reader/stores/bookDataStore';
    import { notebookStore } from '$lib/reader/stores/notebookStore';
    import { annotationService } from '$lib/reader/services/AnnotationService';
    import { useTextSelector } from '$lib/reader/hooks/useTextSelector.svelte';
    import { useFoliateEvents } from '$lib/reader/hooks/useFoliateEvents.svelte';
    import {
        getPosition,
        getPopupPosition,
        type TextSelection,
        type Position
    } from '$lib/reader/utils/sel';
    import AnnotationPopup from './AnnotationPopup.svelte';
    import type { CommentType } from '@cozy-reader/database';
    import { uniqueId } from '$lib/reader/utils/misc';

    interface Props {
        bookKey: string;
    }

    const { bookKey }: Props = $props();

    const view = $derived(readerStore.getView(bookKey));
    const readerSettings = $derived(readerStore.getReaderSettings(bookKey));
    const bookData = $derived(bookDataStore.getBookData(bookKey));
    const progress = $derived(readerStore.getProgress(bookKey));

    let containerRef: HTMLDivElement | null = $state(null);
    let selection = $state<TextSelection | null>(null);
    let showAnnotPopup = $state(false);
    let trianglePosition = $state<Position | undefined>();
    let annotPopupPosition = $state<Position | undefined>();
    let highlightOptionsVisible = $state(false);
    let selectedStyle = $state<CommentType>('highlight');
    let selectedColor = $state('yellow');

    const popupPadding = 10;
    const maxWidth = window.innerWidth - 2 * popupPadding;
    const maxHeight = window.innerHeight - 2 * popupPadding;
    const annotPopupWidth = Math.min(300, maxWidth);
    const annotPopupHeight = 44;

    const handleDismissPopup = () => {
        selection = null;
        showAnnotPopup = false;
        highlightOptionsVisible = false;
    };

    const handleDismissPopupAndSelection = () => {
        handleDismissPopup();
        view?.deselect();
    };

    const {
        handleScroll,
        handleTouchStart,
        handleTouchEnd,
        handlePointerdown,
        handlePointerup,
        handleSelectionchange,
        handleShowPopup,
        handleUpToPopup,
        handleContextmenu,
        setup: setupTextSelector
    } = useTextSelector(
        bookKey,
        (sel) => {
            selection = sel;
        },
        handleDismissPopup
    );

    // 重新定位弹窗
    const repositionPopups = () => {
        if (!selection || !selection.text || !readerSettings) return;
        const gridFrame = document.querySelector(`#gridcell-${bookKey}`);
        if (!gridFrame) return;
        const rect = gridFrame.getBoundingClientRect();
        const triangPos = getPosition(selection.range, rect, popupPadding, readerSettings.vertical);
        const annotPopupPos = getPopupPosition(
            triangPos,
            rect,
            readerSettings.vertical ? annotPopupHeight : annotPopupWidth,
            readerSettings.vertical ? annotPopupWidth : annotPopupHeight,
            popupPadding
        );
        if (triangPos.point.x === 0 || triangPos.point.y === 0) return;
        annotPopupPosition = annotPopupPos;
        trianglePosition = triangPos;
    };

    const onLoad = (event: Event) => {
        const detail = (event as CustomEvent).detail;
        const { doc, index } = detail;

        const handleTouchmove = () => {
            showAnnotPopup = false;
        };

        // 附加选择监听器
        if (view?.renderer?.addEventListener) {
            view.renderer.addEventListener('scroll', handleScroll);
            view.renderer.addEventListener('scroll', () => {
                repositionPopups();
            });
        }
        detail.doc?.addEventListener('touchstart', handleTouchStart);
        detail.doc?.addEventListener('touchmove', handleTouchmove);
        detail.doc?.addEventListener('touchend', handleTouchEnd);
        detail.doc?.addEventListener('pointerdown', handlePointerdown);
        detail.doc?.addEventListener('pointerup', (ev: PointerEvent) =>
            handlePointerup(doc, index, ev)
        );
        detail.doc?.addEventListener('selectionchange', () => handleSelectionchange(doc, index));
        detail.doc?.addEventListener('contextmenu', handleContextmenu);
    };

    const onDrawAnnotation = (event: Event) => {
        // TODO: 实现注释绘制逻辑
        const detail = (event as CustomEvent).detail;
        const { draw, annotation } = detail;
        // 这里需要根据注释类型绘制高亮、下划线等
    };

    const onShowAnnotation = (event: Event) => {
        const detail = (event as CustomEvent).detail;
        const { value: cfi, index, range } = detail;
        // TODO: 从数据库加载注释并显示
        const newSelection: TextSelection = {
            key: bookKey,
            annotated: true,
            text: '',
            range,
            index
        };
        selection = newSelection;
        handleUpToPopup();
    };

    // 使用 $effect 来管理 foliate 事件
    $effect(() => {
        return useFoliateEvents(view, {
            onLoad,
            onDrawAnnotation,
            onShowAnnotation
        });
    });

    // 监听选择变化，更新弹窗位置
    $effect(() => {
        handleShowPopup(showAnnotPopup);
    });

    $effect(() => {
        highlightOptionsVisible = !!(selection && selection.annotated);
        if (selection && selection.text.trim().length > 0 && readerSettings) {
            repositionPopups();
            showAnnotPopup = true;
        }
    });

    // 监听滚动事件，更新弹窗位置
    $effect(() => {
        if (!view?.renderer) return;
        const onScroll = () => {
            if (showAnnotPopup) {
                repositionPopups();
            }
        };
        if (view.renderer.addEventListener) {
            view.renderer.addEventListener('scroll', onScroll);
            return () => {
                if (view.renderer.removeEventListener) {
                    view.renderer.removeEventListener('scroll', onScroll);
                }
            };
        }
    });

    const handleCopy = async () => {
        if (!selection || !selection.text) return;
        try {
            await navigator.clipboard.writeText(selection.text);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
        handleDismissPopupAndSelection();
    };

    const handleHighlight = async (update = false) => {
        if (!selection || !selection.text || !view) return;
        const cfi = view.getCFI(selection.index, selection.range);
        if (!cfi) return;

        const annotation = {
            id: uniqueId(),
            type: selectedStyle as CommentType,
            cfi,
            text: selection.text,
            note: '',
            color: selectedColor,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        try {
            if (update && annotation.id) {
                await annotationService.updateAnnotation(bookKey, annotation.id, annotation);
            } else {
                await annotationService.saveAnnotation(bookKey, annotation);
            }
            await view.addAnnotation(annotation);
            if (selection) {
                selection = { ...selection, annotated: true };
            }
        } catch (err) {
            console.error('Failed to save annotation:', err);
        }
    };

    const handleDeleteHighlight = async () => {
        if (!selection || !view) return;
        const cfi = view.getCFI(selection.index, selection.range);
        if (!cfi) return;

        try {
            await annotationService.deleteAnnotation(bookKey, cfi);
            await view.deleteAnnotation({ cfi } as any);
            handleDismissPopupAndSelection();
        } catch (err) {
            console.error('Failed to delete annotation:', err);
        }
    };

    const handleAnnotate = async () => {
        if (!selection || !selection.text) return;
        await handleHighlight(true);
        notebookStore.setNewAnnotation(selection);
        notebookStore.setVisible(true);
        handleDismissPopup();
    };

    const handleSearch = () => {
        if (!selection || !selection.text) return;
        handleDismissPopupAndSelection();
        // TODO: 触发搜索
    };

    const selectionAnnotated = $derived(selection?.annotated);
    const isPDF = $derived(bookData?.book?.format === 'PDF');
    const buttons = $derived([
        { tooltipText: '复制', Icon: Copy, onClick: handleCopy },
        {
            tooltipText: selectionAnnotated ? '删除高亮' : '高亮',
            Icon: selectionAnnotated ? Trash2 : Highlighter,
            onClick: selectionAnnotated ? handleDeleteHighlight : handleHighlight,
            disabled: isPDF
        },
        {
            tooltipText: '注释',
            Icon: SquarePen,
            onClick: handleAnnotate,
            disabled: isPDF
        },
        {
            tooltipText: '搜索',
            Icon: Search,
            onClick: handleSearch,
            disabled: isPDF
        }
    ]);

    let cleanupTextSelector: (() => void) | null = null;

    onMount(() => {
        cleanupTextSelector = setupTextSelector();
    });

    onDestroy(() => {
        cleanupTextSelector?.();
    });
</script>

<div bind:this={containerRef} role="toolbar" tabindex="-1">
    {#if showAnnotPopup && trianglePosition && annotPopupPosition && readerSettings}
        <AnnotationPopup
            dir={readerSettings.rtl ? 'rtl' : 'ltr'}
            isVertical={readerSettings.vertical}
            {buttons}
            position={annotPopupPosition}
            {trianglePosition}
            {highlightOptionsVisible}
            {selectedStyle}
            {selectedColor}
            popupWidth={annotPopupWidth}
            popupHeight={annotPopupHeight}
            onHighlight={handleHighlight}
            onDismiss={handleDismissPopupAndSelection}
        />
    {/if}
</div>
