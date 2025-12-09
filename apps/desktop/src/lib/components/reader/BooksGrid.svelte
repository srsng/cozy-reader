<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { bookDataStore } from '$lib/reader/stores/bookDataStore';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { getGridTemplate, getInsetEdges } from '$lib/reader/utils/grid';
    import { getViewInsets } from '$lib/reader/utils/insets';
    import type { Insets } from '$lib/reader/utils/insets';
    import FoliateReader from './foliate/FoliateReader.svelte';
    import HeaderBar from './HeaderBar.svelte';
    import FooterBar from './FooterBar.svelte';
    import ProgressInfo from './ProgressInfo.svelte';
    import Sidebar from './sidebar/Sidebar.svelte';
    import SettingsDialog from './settings/SettingsDialog.svelte';
    import SectionInfo from './SectionInfo.svelte';
    import HintInfo from './HintInfo.svelte';
    import Ribbon from './Ribbon.svelte';
    import DoubleBorder from './DoubleBorder.svelte';
    import FootnotePopup from './FootnotePopup.svelte';
    import Annotator from './annotator/Annotator.svelte';
    import Notebook from './notebook/Notebook.svelte';

    interface Props {
        bookKeys: string[];
        onCloseBook?: (bookKey: string) => void;
    }

    const { bookKeys, onCloseBook }: Props = $props();

    let aspectRatio = $state(window.innerWidth / window.innerHeight);
    let screenInsets: Insets | null = $state({ top: 0, right: 0, bottom: 0, left: 0 });

    // 计算网格模板
    const gridTemplate = $derived(getGridTemplate(bookKeys.length, aspectRatio));

    // 响应窗口大小变化
    const handleResize = () => {
        aspectRatio = window.innerWidth / window.innerHeight;
    };

    // 计算网格边距
    const calcGridInsets = (index: number, count: number): Insets => {
        if (!screenInsets) return { top: 0, right: 0, bottom: 0, left: 0 };
        const { top, right, bottom, left } = getInsetEdges(index, count, aspectRatio);
        return {
            top: top ? screenInsets.top : 0,
            right: right ? screenInsets.right : 0,
            bottom: bottom ? screenInsets.bottom : 0,
            left: left ? screenInsets.left : 0
        };
    };

    // 更新文档标题
    $effect(() => {
        const sideBarBookKey = sidebarStore.getSideBarBookKey();
        if (!sideBarBookKey) return;
        const bookData = bookDataStore.getBookData(sideBarBookKey);
        if (bookData?.book) {
            document.title = bookData.book.title;
        }
    });

    // 更新网格边距
    $effect(() => {
        if (!screenInsets) return;
        bookKeys.forEach((bookKey, index) => {
            const gridInsets = calcGridInsets(index, bookKeys.length);
            readerStore.setGridInsets(bookKey, gridInsets);
        });
    });

    onMount(() => {
        window.addEventListener('resize', handleResize);
    });

    onDestroy(() => {
        window.removeEventListener('resize', handleResize);
    });
</script>

{#if screenInsets}
    <div
        class="books-grid bg-background relative grid h-full flex-grow"
        style="grid-template-columns: {gridTemplate.columns}; grid-template-rows: {gridTemplate.rows};"
        role="main"
        aria-label="书籍内容"
    >
        {#each bookKeys as bookKey, index (bookKey)}
            {@const bookData = bookDataStore.getBookData(bookKey)}
            {@const config = bookDataStore.getConfig(bookKey)}
            {@const progress = readerStore.getProgress(bookKey)}
            {@const readerSettings = readerStore.getReaderSettings(bookKey)}
            {@const viewState = readerStore.getViewState(bookKey)}
            {@const gridInsets = calcGridInsets(index, bookKeys.length)}
            {@const book = bookData?.book}
            {@const bookDoc = bookData?.bookDoc}

            {#if book && config && bookDoc && readerSettings && viewState}
                {@const section = progress?.section}
                {@const pageinfo = progress?.pageinfo}
                {@const timeinfo = progress?.timeinfo}
                {@const sectionLabel = progress?.sectionLabel}
                {@const isBookmarked = viewState?.ribbonVisible ?? false}
                {@const horizontalGapPercent = readerSettings.gapPercent ?? 0}
                {@const viewInsets = getViewInsets(readerSettings)}
                {@const contentInsets = {
                    top: gridInsets.top + viewInsets.top,
                    right: gridInsets.right + viewInsets.right,
                    bottom: gridInsets.bottom + viewInsets.bottom,
                    left: gridInsets.left + viewInsets.left
                }}
                {@const scrolled = readerSettings.scrolled ?? false}
                {@const showBarsOnScroll = readerSettings.showBarsOnScroll ?? false}
                <!-- 滚动模式下根据 showBarsOnScroll 控制栏的显示 -->
                {@const isScrolledMode = readerSettings.scrolled ?? false}
                {@const showBarsOnScrollSetting = readerSettings.showBarsOnScroll ?? false}
                {@const showHeader =
                    readerSettings.showHeader && (isScrolledMode ? showBarsOnScrollSetting : true)}
                {@const showFooter =
                    readerSettings.showFooter && (isScrolledMode ? showBarsOnScrollSetting : true)}
                {@const isVertical = readerSettings.vertical ?? false}
                {@const showDoubleBorder = readerSettings.doubleBorder ?? false}
                {@const borderColor = readerSettings.borderColor ?? '#000000'}

                <div id="gridcell-{bookKey}" class="relative h-full w-full overflow-hidden">
                    {#if isBookmarked}
                        <Ribbon />
                    {/if}
                    <SectionInfo
                        {bookKey}
                        section={sectionLabel}
                        {showDoubleBorder}
                        isScrolled={scrolled}
                        {isVertical}
                        horizontalGap={horizontalGapPercent}
                        {contentInsets}
                        {gridInsets}
                    />
                    <HintInfo
                        {bookKey}
                        {showDoubleBorder}
                        isScrolled={scrolled}
                        {isVertical}
                        horizontalGap={horizontalGapPercent}
                        {contentInsets}
                        {gridInsets}
                    />
                    {#if showDoubleBorder && isVertical}
                        <DoubleBorder
                            {borderColor}
                            {showHeader}
                            {showFooter}
                            insets={contentInsets}
                        />
                    {/if}
                    <Annotator {bookKey} />
                    <FootnotePopup {bookKey} {bookDoc} />
                    <SettingsDialog {bookKey} />
                    <Notebook {bookKey} />

                    <HeaderBar {bookKey} {book} isVisible={showHeader} />

                    {#if book.path}
                        <FoliateReader filePath={book.path} {book} {bookKey} />
                    {/if}

                    {#if showFooter && progress}
                        <ProgressInfo {section} {pageinfo} {timeinfo} readerSettings={readerSettings} />
                    {/if}

                    {#if progress}
                        <FooterBar
                            {bookKey}
                            {book}
                            section={progress.section}
                            pageinfo={progress.pageinfo}
                            timeinfo={progress.timeinfo}
                            isVisible={showFooter}
                        />
                    {/if}

                    <Sidebar {bookKey} {book} />
                </div>
            {/if}
        {/each}
    </div>
{/if}

<style>
    .books-grid {
        display: grid;
        height: 100%;
        width: 100%;
    }
</style>
