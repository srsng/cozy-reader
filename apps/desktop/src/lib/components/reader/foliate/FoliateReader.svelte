<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import type { Book } from '@cozy-reader/database';
    import type {
        FoliateViewElement,
        BookDoc,
        BookConfig,
        TOCItem,
        PageInfo,
        TimeInfo
    } from '$lib/reader/types';
    import type { ReaderSettings } from '$lib/reader/settings';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import {
        getStyles,
        transformStylesheet,
        applyImageStyle,
        applyFixedlayoutStyles,
        applyScrollModeClass
    } from '$lib/reader/style';
    import { mode } from 'mode-watcher';
    import { manageSyntaxHighlighting } from '$lib/reader/services/HighlightService';
    import { mountAdditionalFonts, isCJKLang } from '$lib/reader/services/FontService';
    import { getDirection } from '$lib/reader/document';
    import { DocumentService } from '$lib/reader/services/DocumentService';
    import { getDefaultReaderSettings } from '$lib/reader/constants';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { uniqueId } from '$lib/reader/utils/misc';
    import { getMaxInlineSize } from '$lib/reader/utils/config';
    import HeaderBar from '../HeaderBar.svelte';
    import FooterBar from '../FooterBar.svelte';
    import Sidebar from '../sidebar/Sidebar.svelte';
    import Annotator from '../annotator/Annotator.svelte';
    import SettingsDialog from '../settings/SettingsDialog.svelte';
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { inject } from '$lib/utils/context';
    import { untrack } from 'svelte';
    import { bookDataStore } from '$lib/reader';

    // 获取全局 READER_SETTINGS（响应式）
    const globalReaderSettings = inject(READER_SETTINGS);

    interface Props {
        filePath: string;
        book: Book;
        bookKey?: string; // 可选的 bookKey，如果不提供则自动生成
    }

    const { filePath, book, bookKey: providedBookKey }: Props = $props();

    let containerRef: HTMLDivElement | null = $state(null);
    let viewContainerRef: HTMLDivElement | null = $state(null);
    let viewElement: FoliateViewElement | null = $state(null);
    let error: string | null = $state(null);

    // 保存 transformTarget 事件监听器引用，用于清理
    let transformTargetLoadHandler: ((event: Event) => void) | null = null;
    let transformTargetDataHandler: ((event: Event) => void) | null = null;

    const bookKey = providedBookKey || `${book.id}-${uniqueId()}`;
    let viewState = $state(readerStore.getViewState(bookKey));
    let readerSettings = $state<ReaderSettings | null>(null);
    let bookDoc: BookDoc | null = $state(null);

    // 从 bookDataStore 获取 bookConfig（参考 readest 架构）
    const bookConfig = $derived(bookDataStore.getConfig(bookKey));

    let sidebarPinned = $state(sidebarStore.getPinned());
    let sidebarVisible = $state(sidebarStore.getVisible());

    // 响应式主题状态，使用全局主题系统
    const currentTheme = $derived(mode.current);

    // 同步 viewState.loading 到本地 loading 状态
    const loading = $derived(viewState?.loading ?? false);
    const docLoaded = $derived(viewState?.inited ?? false);

    // Header/Footer 显示状态（从 readerSettings 派生）
    const headerVisible = $derived.by(() => readerSettings?.showHeader ?? false);
    const footerVisible = $derived.by(() => readerSettings?.showFooter ?? false);

    // 订阅 store 更新（不包含 bookConfig，从 bookDataStore 获取）
    const unsubscribe = readerStore.subscribe((state) => {
        const newViewState = state.viewStates[bookKey];
        if (newViewState) {
            viewState = newViewState;
            readerSettings = newViewState.readerSettings;
            bookDoc = newViewState.bookDoc;
            viewElement = newViewState.view;
        }
    });

    // 同步全局 READER_SETTINGS 到当前书籍的 readerSettings（仅运行时，不保存到数据库）
    // 当全局设置变化时，自动同步到当前书籍（保持书籍特定设置的优先级）
    let lastGlobalSettingsHash = $state<string | null>(null);
    $effect(() => {
        if (!viewState || !readerSettings) return;

        // 获取当前全局设置
        const currentGlobalSettings = $globalReaderSettings;
        const globalSettingsHash = JSON.stringify(currentGlobalSettings);

        // 如果全局设置没有变化，跳过同步
        if (globalSettingsHash === lastGlobalSettingsHash) return;
        lastGlobalSettingsHash = globalSettingsHash;

        // 获取书籍特定配置（如果有）
        const bookConfigSettings = bookConfig?.readerSettings || {};

        // 合并：全局设置 + 书籍配置设置（参考 readest）
        const mergedSettings: ReaderSettings = {
            ...currentGlobalSettings,
            ...bookConfigSettings
        } as ReaderSettings;

        // 检查是否需要更新（避免不必要的更新）
        const currentHash = JSON.stringify(readerSettings);
        const newHash = JSON.stringify(mergedSettings);
        if (currentHash !== newHash) {
            // 只更新运行时状态，不保存到数据库（避免覆盖书籍特定设置）
            // 书籍特定设置应该由用户明确修改时才保存
            readerStore.setReaderSettings(bookKey, mergedSettings, false);
        }
    });

    /**
     * 执行内联脚本（仅在 Tauri 平台）
     */
    const evalInlineScripts = (doc: Document) => {
        if (doc.defaultView && doc.defaultView.frameElement) {
            const iframe = doc.defaultView.frameElement;
            if (!(iframe instanceof HTMLIFrameElement)) {
                return;
            }
            const contentWindow = iframe.contentWindow;
            if (!contentWindow) {
                return;
            }
            const scripts = doc.querySelectorAll('script:not([src])');
            scripts.forEach((script, index) => {
                const scriptContent = script.textContent || script.innerHTML;
                if (!scriptContent) {
                    return;
                }
                try {
                    console.warn('Evaluating inline scripts in iframe');
                    // 使用 Function 构造函数代替 eval，更安全且类型友好
                    const func = new Function(scriptContent);
                    func.call(contentWindow);
                } catch (error) {
                    console.error(`Error executing iframe script ${index + 1}:`, error);
                }
            });
        }
    };

    /**
     * 计算并应用边距和间距
     * 统一布局：header/footer 在外部，只设置左右边距
     */
    const applyMarginAndGap = (
        view: FoliateViewElement,
        settings: ReaderSettings,
        insets: { top: number; right: number; bottom: number; left: number } = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    ) => {
        const showDoubleBorder = settings.vertical && settings.doubleBorder;
        const showDoubleBorderHeader = showDoubleBorder && settings.showHeader;
        const showDoubleBorderFooter = showDoubleBorder && settings.showFooter;
        const moreRightInset = showDoubleBorderHeader ? 32 : 0;
        const moreLeftInset = showDoubleBorderFooter ? 32 : 0;
        const rightMargin = insets.right + moreRightInset;
        const leftMargin = insets.left + moreLeftInset;

        // 只设置左右边距，不设置上下边距（header/footer 在外部布局中）
        view.renderer.setAttribute('margin-top', '0px');
        view.renderer.setAttribute('margin-right', `${rightMargin}px`);
        view.renderer.setAttribute('margin-bottom', '0px');
        view.renderer.setAttribute('margin-left', `${leftMargin}px`);
        view.renderer.setAttribute('gap', `${settings.gapPercent ?? 5}%`);

        // 设置 flow 属性
        if (settings.scrolled) {
            view.renderer.setAttribute('flow', 'scrolled');
        } else {
            // 分页模式下移除 flow 属性（使用默认值 'paginated'）
            view.renderer.removeAttribute?.('flow');
        }
    };

    // 进度更新处理（添加去重保护，避免重复的 relocate 事件）
    let lastProcessedLocation = $state<string | null>(null);
    let lastProcessedTime = $state<number>(0);
    let progressUpdateTimer: ReturnType<typeof setTimeout> | null = null;

    const handleProgressRelocate = (event: Event) => {
        const detail = (event as CustomEvent).detail;
        // foliate-js 的 relocate 事件 detail 包含: { cfi, tocItem, pageItem, range, ...progress }
        // progress 包含: section, pageinfo, timeinfo 等
        const location = detail.cfi || '';
        const tocItem = detail.tocItem || null;
        const section = detail.section || { current: 0, total: 0 };
        const pageinfo = detail.pageinfo || detail.pageItem || { current: 0, total: 0 };
        const timeinfo = detail.timeinfo || detail.time || { section: 0, total: 0 };

        const now = Date.now();

        // 去重：如果相同位置在 50ms 内重复触发，忽略
        if (location === lastProcessedLocation && now - lastProcessedTime < 50) {
            return;
        }

        lastProcessedLocation = location;
        lastProcessedTime = now;

        console.log('Progress relocated:', {
            location,
            cfi: detail.cfi,
            pageinfo,
            section,
            tocItem: detail.tocItem?.label
        });

        // 清除之前的定时器
        if (progressUpdateTimer) {
            clearTimeout(progressUpdateTimer);
        }

        // 防抖：延迟更新，避免频繁更新
        progressUpdateTimer = setTimeout(() => {
            readerStore.setProgress(
                bookKey,
                location,
                tocItem,
                section,
                pageinfo,
                timeinfo,
                detail.range
            );
            progressUpdateTimer = null;
        }, 150);
    };

    // 订阅侧边栏状态（如果需要的话）
    const sidebarUnsubscribe = sidebarStore.subscribe((state) => {
        // headerVisible 和 footerVisible 现在从 readerSettings 派生，不需要手动设置
        sidebarPinned = state.isPinned;
        sidebarVisible = state.isVisible;
    });

    // 文档数据转换处理
    const getDocTransformHandler = ({ width, height }: { width: number; height: number }) => {
        return (event: Event) => {
            const { detail } = event as CustomEvent;
            detail.data = Promise.resolve(detail.data)
                .then(async (data) => {
                    if (readerSettings && detail.type === 'text/css') {
                        return transformStylesheet(width, height, data);
                    }
                    if (readerSettings && detail.type === 'application/xhtml+xml') {
                        // 应用内容转换（标点、脚注、语言等）
                        const { transformContent } = await import(
                            '$lib/reader/services/TransformService'
                        );
                        return transformContent({
                            bookKey,
                            readerSettings,
                            content: data,
                            transformers: ['punctuation', 'footnote', 'language']
                        });
                    }
                    return data;
                })
                .catch((e) => {
                    console.error(new Error(`Failed to load ${detail.name}`, { cause: e }));
                    return '';
                });
        };
    };

    // 文档加载处理
    const handleDocLoad = (event: Event) => {
        const detail = (event as CustomEvent).detail;
        console.log('doc index loaded:', detail.index);

        if (detail.doc && viewElement && readerSettings) {
            // 确保文档元素存在，避免 paginator.js:206 错误
            if (!detail.doc.documentElement) {
                console.warn('Document element not found');
                return;
            }
            if (!detail.doc.body) {
                console.warn('Document body not found');
                return;
            }

            // 确保 style 对象存在
            if (!detail.doc.documentElement.style) {
                (detail.doc.documentElement as any).style =
                    detail.doc.defaultView?.getComputedStyle(detail.doc.documentElement) || {};
            }
            if (!detail.doc.body.style) {
                (detail.doc.body as any).style =
                    detail.doc.defaultView?.getComputedStyle(detail.doc.body) || {};
            }

            const writingDir = getDirection(detail.doc);
            const newReaderSettings: ReaderSettings = {
                ...readerSettings,
                vertical:
                    writingDir?.vertical ||
                    readerSettings.writingMode.includes('vertical') ||
                    false,
                rtl: writingDir?.rtl || readerSettings.writingMode.includes('rl') || false
            };
            readerStore.setReaderSettings(bookKey, newReaderSettings);

            // 应用固定布局样式
            if (bookDoc?.rendition?.layout === 'pre-paginated') {
                applyFixedlayoutStyles(detail.doc, newReaderSettings);
            }

            // 应用图片样式
            applyImageStyle(detail.doc);

            // 应用滚动模式类
            applyScrollModeClass(detail.doc, newReaderSettings.scrolled || false);

            // 注意：flow 属性只在 applyMarginAndGap 中设置，不在这里设置

            // 处理内联脚本（仅在 Tauri 平台且允许脚本时）
            if (newReaderSettings.allowScript) {
                evalInlineScripts(detail.doc);
            }

            // 语法高亮
            if (newReaderSettings.codeHighlighting) {
                manageSyntaxHighlighting(detail.doc, newReaderSettings);
            }

            // 挂载额外字体（系统字体和 CJK 字体）
            const isCJK = bookDoc?.metadata?.language
                ? isCJKLang(bookDoc.metadata.language)
                : false;
            mountAdditionalFonts(detail.doc, isCJK);

            // TODO: 挂载用户自定义字体（需要从设置中加载）

            // 移除 foliate-paginator 内部的 margin 空间（文档加载后重新应用）
            if (viewElement) {
                removeInternalMargins(viewElement);
            }
        }
    };

    // 初始化视图（带重试机制）
    const initView = async (retryCount: number = 0, maxRetries: number = 2) => {
        try {
            error = null;

            // 动态导入 foliate-js（检查自定义元素是否已定义，避免重复注册）
            if (!customElements.get('foliate-view')) {
                await import('foliate-js/view.js');
            }

            // 创建 foliate-view 元素
            const view = document.createElement('foliate-view') as FoliateViewElement;
            view.id = `foliate-view-${bookKey}`;
            viewElement = view;

            // 初始化视图状态（先初始化，获取 readerSettings）
            // 使用响应式的全局设置
            const currentGlobalReaderSettings = $globalReaderSettings;

            await readerStore.initViewState(
                book,
                bookKey,
                true,
                currentGlobalReaderSettings, // ReaderSettings 类型
                bookConfig ?? undefined,
                maxRetries
            );

            // 等待 bookDoc 加载
            const currentViewState = readerStore.getViewState(bookKey);
            if (!currentViewState?.bookDoc) {
                throw new Error('书籍文档加载失败，请检查文件是否完整');
            }

            // 同步更新本地的 viewState，确保模板能正确渲染
            viewState = currentViewState;
            readerSettings = currentViewState.readerSettings;
            bookDoc = currentViewState.bookDoc;
            // bookConfig 从 bookDataStore 派生，不需要从 viewState 同步

            const doc = currentViewState.bookDoc;
            // 确保 settings 是完整的 ReaderSettings，使用 getDefaultReaderSettings 作为后备
            const settings =
                currentViewState.readerSettings || getDefaultReaderSettings(false, false);

            // 等待 DOM 更新，确保 viewContainerRef 已绑定
            await tick();
            await new Promise((resolve) => setTimeout(resolve, 100));

            // 将 view 元素添加到容器中（必须在 open 之前）
            // 参考 readest：直接将 foliate-view 添加到 foliate-view-container
            if (!viewContainerRef) {
                // 如果 viewContainerRef 还没有绑定，继续等待
                let retries = 0;
                while (!viewContainerRef && retries < 30) {
                    await tick();
                    await new Promise((resolve) => setTimeout(resolve, 50));
                    retries++;
                }
            }

            if (viewContainerRef) {
                // 确保 view 不在其他地方
                if (view.parentElement && view.parentElement !== viewContainerRef) {
                    view.parentElement.removeChild(view);
                }
                // 添加到容器
                if (!viewContainerRef.contains(view)) {
                    viewContainerRef.appendChild(view);
                }
            } else {
                throw new Error('viewContainerRef not found after waiting');
            }

            // bookConfig 从 bookDataStore 获取，不需要从 viewState 获取

            // 设置文档方向
            if (settings.writingMode) {
                const settingsDir =
                    settings.writingMode === 'vertical-rl'
                        ? 'rtl'
                        : settings.writingMode === 'horizontal-rl'
                          ? 'rtl'
                          : 'ltr';
                doc.dir = settingsDir as 'ltr' | 'rtl';
            }

            // 处理固定布局
            if (doc.rendition?.layout === 'pre-paginated' && doc.sections) {
                doc.rendition.spread = settings.spreadMode;
                const coverSide = doc.dir === 'rtl' ? 'right' : 'left';
                doc.sections[0]!.pageSpread = settings.keepCoverSpread ? '' : coverSide;
            }

            // 打开书籍（view 必须已经在 DOM 中）
            if (viewContainerRef && !viewContainerRef.contains(view)) {
                // 如果 view 在其他地方，先移除
                if (view.parentElement && view.parentElement !== viewContainerRef) {
                    view.parentElement.removeChild(view);
                }
                viewContainerRef.appendChild(view);
            }

            await view.open(doc);
            readerStore.setView(bookKey, view);

            // open 后再次检查，确保 view 在容器中
            if (viewContainerRef && !viewContainerRef.contains(view)) {
                viewContainerRef.appendChild(view);
            }

            // 移除 foliate-paginator 内部的 margin 空间
            removeInternalMargins(view);

            // 设置事件监听器
            transformTargetLoadHandler = (event: Event) => {
                const { detail } = event as CustomEvent;
                if (detail.isScript) {
                    detail.allowScript = settings.allowScript ?? false;
                }
            };
            view.book.transformTarget?.addEventListener('load', transformTargetLoadHandler);

            const viewWidth = window.innerWidth;
            const viewHeight = window.innerHeight;
            transformTargetDataHandler = getDocTransformHandler({
                width: viewWidth,
                height: viewHeight
            });
            view.book.transformTarget?.addEventListener('data', transformTargetDataHandler);

            // 应用样式
            view.renderer.setStyles?.(getStyles(settings));

            // 先设置 flow 属性（影响其他属性的行为）
            // 注意：flow 属性会在文档加载完成后通过 handleDocLoad 设置，避免 paginator.js:122 错误
            // 这里先不设置，等待文档加载完成

            // 设置 animated 属性
            if (settings.animated) {
                view.renderer.setAttribute('animated', '');
            } else {
                view.renderer.removeAttribute?.('animated');
            }

            // 设置渲染器属性
            if (doc.rendition?.layout === 'pre-paginated') {
                view.renderer.setAttribute('zoom', settings.zoomMode || 'fit-page');
                view.renderer.setAttribute('spread', settings.spreadMode || 'auto');
                view.renderer.setAttribute('scale-factor', String(settings.zoomLevel || 100));
            } else {
                const maxColumnCount = String(settings.maxColumnCount ?? 2);
                view.renderer.setAttribute('max-column-count', maxColumnCount);

                const maxInlineSize = getMaxInlineSize(settings);
                view.renderer.setAttribute('max-inline-size', `${maxInlineSize}px`);

                const maxBlockSize = `${settings.maxBlockSize ?? 1200}px`;
                view.renderer.setAttribute('max-block-size', maxBlockSize);
            }

            // 应用边距和间距（使用边距计算函数，传入网格边距）
            const gridInsets = readerStore.getGridInsets(bookKey);
            // 直接使用 gridInsets，让 applyMarginAndGap 函数内部处理滚动模式的逻辑
            applyMarginAndGap(view, settings, gridInsets);

            // 初始化视图位置（恢复阅读进度）
            // 优先使用当前 viewState 中的 bookConfig，因为它可能已从数据库加载
            const configToUse = bookConfig;
            const lastLocation = configToUse?.location;

            console.log('Restoring reading progress:', {
                lastLocation,
                progress: configToUse?.progress,
                bookConfig: configToUse
            });

            // 恢复阅读进度（参考 readest）
            if (lastLocation && typeof lastLocation === 'string' && lastLocation.trim()) {
                try {
                    console.log('Restoring from location:', lastLocation);
                    await view.init({ lastLocation });
                } catch (locationError) {
                    console.warn('Failed to restore location, trying progress:', locationError);
                    // 如果 location 失败，尝试使用 progress
                    const progress = configToUse?.progress;
                    if (
                        progress &&
                        Array.isArray(progress) &&
                        progress.length === 2 &&
                        progress[0] > 0
                    ) {
                        const fraction = progress[0] / progress[1];
                        console.log('Restoring from progress fraction:', fraction);
                        await view.goToFraction(fraction);
                    } else {
                        await view.goToFraction(0);
                    }
                }
            } else {
                // 如果没有 location，尝试使用 progress
                const progress = configToUse?.progress;
                if (
                    progress &&
                    Array.isArray(progress) &&
                    progress.length === 2 &&
                    progress[0] > 0
                ) {
                    const fraction = progress[0] / progress[1];
                    console.log('Restoring from progress fraction:', fraction);
                    await view.goToFraction(fraction);
                } else {
                    console.log('No progress to restore, starting from beginning');
                    await view.goToFraction(0);
                }
            }

            readerStore.setViewInited(bookKey, true);

            // 监听 relocate 事件（用于进度同步）
            view.addEventListener('relocate', handleProgressRelocate);
            view.addEventListener('load', handleDocLoad);

            // 监听 renderer 的 relocate 事件，在重新渲染后重新应用 margin 移除
            const handleRendererRelocate = () => {
                removeInternalMargins(view);
            };
            if (view.renderer.addEventListener) {
                view.renderer.addEventListener('relocate', handleRendererRelocate);
                // 保存清理函数引用，以便在组件销毁时清理
                (view as any)._rendererRelocateHandler = handleRendererRelocate;
            }
        } catch (err) {
            console.error('Failed to initialize view:', err);
            const errorObj = err instanceof Error ? err : new Error(String(err));

            // 如果是可重试的错误且未达到最大重试次数，则重试
            if (retryCount < maxRetries && isRetryableError(errorObj)) {
                const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                console.warn(
                    `初始化失败（尝试 ${retryCount + 1}/${maxRetries + 1}），${delay}ms 后重试...`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                return initView(retryCount + 1, maxRetries);
            }

            // 设置错误消息
            error = getFriendlyErrorMessage(errorObj, book);
        }
    };

    /**
     * 判断错误是否可重试
     */
    const isRetryableError = (error: Error): boolean => {
        const message = error.message.toLowerCase();
        // 网络错误、超时错误可以重试
        return (
            message.includes('network') ||
            message.includes('timeout') ||
            message.includes('网络') ||
            message.includes('超时') ||
            message.includes('fetch')
        );
    };

    /**
     * 获取友好的错误消息
     */
    const getFriendlyErrorMessage = (error: Error, book: Book): string => {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('not found') || errorMessage.includes('不存在')) {
            return `书籍文件不存在：${book.path || book.title}`;
        }

        if (errorMessage.includes('empty') || errorMessage.includes('空')) {
            return '书籍文件为空或已损坏';
        }

        if (errorMessage.includes('unsupported') || errorMessage.includes('不支持')) {
            return `不支持的书籍格式：${book.format || '未知格式'}`;
        }

        if (errorMessage.includes('network') || errorMessage.includes('网络')) {
            return '网络错误，请检查网络连接后重试';
        }

        if (errorMessage.includes('permission') || errorMessage.includes('权限')) {
            return '没有权限访问书籍文件';
        }

        if (errorMessage.includes('foliate-js')) {
            return '无法加载阅读器库，请刷新页面重试';
        }

        // 默认错误消息
        return `加载失败：${error.message || '未知错误'}`;
    };

    /**
     * 同步 dark 类到所有 iframe 文档
     * 确保主题切换时 iframe 文档能够正确响应 CSS 变量变化
     */
    const syncDarkClassToDocuments = (view: FoliateViewElement, isDark: boolean) => {
        try {
            // 对于固定布局，通过 getContents 获取所有文档
            if (bookDoc?.rendition?.layout === 'pre-paginated') {
                const docs = view.renderer.getContents?.();
                if (docs && Array.isArray(docs)) {
                    docs.forEach(({ doc }) => {
                        if (doc && doc instanceof Document && doc.documentElement) {
                            doc.documentElement.classList.toggle('dark', isDark);
                        }
                    });
                }
            } else {
                // 对于普通布局，通过 shadowRoot 查找 iframe
                const rendererElement = view.renderer as unknown as HTMLElement;
                const shadowRoot = rendererElement.shadowRoot;
                if (shadowRoot) {
                    // 查找所有 iframe
                    const iframes = shadowRoot.querySelectorAll('iframe');
                    iframes.forEach((iframe) => {
                        try {
                            const iframeDoc = iframe.contentDocument;
                            if (iframeDoc && iframeDoc.documentElement) {
                                iframeDoc.documentElement.classList.toggle('dark', isDark);
                            }
                        } catch (e) {
                            // 忽略跨域错误
                        }
                    });
                }
            }
        } catch (error) {
            // 忽略访问错误
            console.warn('同步 dark 类时出错:', error);
        }
    };

    /**
     * 移除 foliate-paginator 内部的 margin 空间
     * 通过 shadowRoot 访问并修改 CSS 变量和布局
     */
    const removeInternalMargins = (view: FoliateViewElement) => {
        const renderer = view.renderer;
        if (!renderer) return;

        // 访问 shadowRoot（foliate-paginator 是自定义元素，使用 Shadow DOM）
        // renderer 是 HTMLElement 类型，但类型定义中可能没有 shadowRoot
        const rendererElement = renderer as unknown as HTMLElement;
        const shadowRoot = rendererElement.shadowRoot;
        if (!shadowRoot) return;

        const topElement = shadowRoot.getElementById('top');
        if (!topElement) return;

        // 将 CSS 变量设置为 0，移除 header/footer 的空间
        topElement.style.setProperty('--_margin-top', '0px');
        topElement.style.setProperty('--_margin-bottom', '0px');

        // 修改 grid-template-rows 为单行布局（只保留内容区域）
        // 原始布局：minmax(var(--_margin-top), 1fr) minmax(0, var(--_max-height)) minmax(var(--_margin-bottom), 1fr)
        // 新布局：1fr（让内容区域占据所有可用空间）
        // 由于 #container 的 grid-row 是 1 / -1，它会占据所有行
        topElement.style.setProperty('grid-template-rows', '1fr');

        // 隐藏 header 和 footer 元素
        const header = shadowRoot.getElementById('header');
        const footer = shadowRoot.getElementById('footer');
        if (header) {
            header.style.display = 'none';
        }
        if (footer) {
            footer.style.display = 'none';
        }
    };

    // 响应式样式更新：监听 readerSettings 和主题变化
    // 使用防抖和值比较避免无限循环
    let lastSettingsHash = $state<string | null>(null);
    let updateTimeout: ReturnType<typeof setTimeout> | null = null;

    $effect(() => {
        if (!viewElement || !readerSettings || !viewState?.inited) return;

        // 创建设置哈希值，避免不必要的更新
        // 使用 currentTheme 作为响应式依赖，主题变化时自动触发更新
        const settingsHash = JSON.stringify({
            marginTopPx: readerSettings.marginTopPx,
            marginBottomPx: readerSettings.marginBottomPx,
            marginLeftPx: readerSettings.marginLeftPx,
            marginRightPx: readerSettings.marginRightPx,
            gapPercent: readerSettings.gapPercent,
            vertical: readerSettings.vertical,
            doubleBorder: readerSettings.doubleBorder,
            showHeader: readerSettings.showHeader,
            showFooter: readerSettings.showFooter,
            scrolled: readerSettings.scrolled,
            animated: readerSettings.animated,
            maxColumnCount: readerSettings.maxColumnCount,
            maxInlineSize: readerSettings.maxInlineSize,
            maxBlockSize: readerSettings.maxBlockSize,
            zoomMode: readerSettings.zoomMode,
            spreadMode: readerSettings.spreadMode,
            zoomLevel: readerSettings.zoomLevel,
            theme: currentTheme
        });

        // 如果设置没有变化，跳过更新
        if (settingsHash === lastSettingsHash) return;
        lastSettingsHash = settingsHash;

        // 清除之前的定时器
        if (updateTimeout) {
            clearTimeout(updateTimeout);
            updateTimeout = null;
        }

        // 立即执行更新，不使用防抖，确保设置实时生效
        if (!viewElement || !readerSettings || !viewState?.inited) return;

        const currentReaderSettings = readerSettings;

        try {
            viewElement.renderer.setStyles?.(getStyles(currentReaderSettings));

            // 同步 dark 类到所有 iframe 文档，确保主题切换时 CSS 变量正确响应
            syncDarkClassToDocuments(viewElement, currentTheme === 'dark');

            // 注意：flow 属性只在 applyMarginAndGap 中设置，不在这里设置

            // 更新 animated 属性
            if (currentReaderSettings.animated) {
                viewElement.renderer.setAttribute('animated', '');
            } else {
                viewElement.renderer.removeAttribute?.('animated');
            }

            // 更新渲染器属性
            if (bookDoc?.rendition?.layout === 'pre-paginated') {
                viewElement.renderer.setAttribute(
                    'zoom',
                    currentReaderSettings.zoomMode || 'fit-page'
                );
                viewElement.renderer.setAttribute(
                    'spread',
                    currentReaderSettings.spreadMode || 'auto'
                );
                viewElement.renderer.setAttribute(
                    'scale-factor',
                    String(currentReaderSettings.zoomLevel || 100)
                );
            } else {
                const maxColumnCount = String(currentReaderSettings.maxColumnCount ?? 2);
                viewElement.renderer.setAttribute('max-column-count', maxColumnCount);

                const maxInlineSize = getMaxInlineSize(currentReaderSettings);
                viewElement.renderer.setAttribute('max-inline-size', `${maxInlineSize}px`);

                const maxBlockSize = `${currentReaderSettings.maxBlockSize ?? 1200}px`;
                viewElement.renderer.setAttribute('max-block-size', maxBlockSize);
            }

            // 更新边距（传入网格边距）
            const gridInsets = readerStore.getGridInsets(bookKey);
            // 直接使用 gridInsets，让 applyMarginAndGap 函数内部处理滚动模式的逻辑
            applyMarginAndGap(viewElement, currentReaderSettings, gridInsets);

            // 修复滚动模式下的文档元素问题（避免 paginator.js:206 错误）
            // 注意：这个错误通常发生在文档元素还未完全加载时
            // 我们通过监听 load 事件来确保文档元素存在

            // 对于固定布局，更新所有文档的样式
            if (bookDoc?.rendition?.layout === 'pre-paginated' && currentReaderSettings) {
                try {
                    const docs = viewElement.renderer.getContents?.();
                    if (docs && Array.isArray(docs)) {
                        const settings = currentReaderSettings;
                        docs.forEach(({ doc }) => {
                            // 确保 doc 是有效的 Document 对象
                            if (doc && doc instanceof Document) {
                                applyFixedlayoutStyles(doc, settings);
                                applyScrollModeClass(doc, settings.scrolled || false);
                            }
                        });
                    }
                } catch (error) {
                    // 忽略 getContents 错误，可能在某些情况下不可用
                    console.warn('无法获取文档内容以更新样式:', error);
                }
            }
        } catch (error) {
            console.error('Error updating view settings:', error);
        }

        return () => {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
                updateTimeout = null;
            }
        };
    });

    // 自动保存封面
    let coverCleanup: (() => void) | null = null;
    $effect(() => {
        if (coverCleanup) {
            coverCleanup();
            coverCleanup = null;
        }
        if (bookDoc && viewState?.inited) {
            import('$lib/reader/hooks/useAutoSaveBookCover').then(({ useAutoSaveBookCover }) => {
                coverCleanup = useAutoSaveBookCover(bookKey, bookDoc);
            });
        }
        return () => {
            if (coverCleanup) {
                coverCleanup();
                coverCleanup = null;
            }
        };
    });

    // 快捷键处理
    let shortcutsCleanup: (() => void) | null = null;
    $effect(() => {
        if (shortcutsCleanup) {
            shortcutsCleanup();
            shortcutsCleanup = null;
        }
        if (viewState?.inited && viewElement) {
            import('$lib/reader/hooks/useBookShortcuts').then(
                ({ useBookShortcuts, createDefaultShortcutHandlers }) => {
                    const handlers = createDefaultShortcutHandlers(bookKey);
                    shortcutsCleanup = useBookShortcuts(bookKey, handlers);
                }
            );
        }
        return () => {
            if (shortcutsCleanup) {
                shortcutsCleanup();
                shortcutsCleanup = null;
            }
        };
    });

    onMount(() => {
        // 将 bookKey 添加到 bookKeys 列表（如果还没有）
        const currentBookKeys = readerStore.getBookKeys();
        if (!currentBookKeys.includes(bookKey)) {
            readerStore.setBookKeys([...currentBookKeys, bookKey]);
        }

        initView();

        return () => {
            if (coverCleanup) {
                coverCleanup();
            }
        };
    });

    onDestroy(() => {
        unsubscribe();
        sidebarUnsubscribe();

        // 清理进度更新定时器
        if (progressUpdateTimer) {
            clearTimeout(progressUpdateTimer);
            progressUpdateTimer = null;
        }

        // 清理 transformTarget 事件监听器
        if (viewElement?.book?.transformTarget) {
            if (transformTargetLoadHandler) {
                viewElement.book.transformTarget.removeEventListener(
                    'load',
                    transformTargetLoadHandler
                );
                transformTargetLoadHandler = null;
            }
            if (transformTargetDataHandler) {
                viewElement.book.transformTarget.removeEventListener(
                    'data',
                    transformTargetDataHandler
                );
                transformTargetDataHandler = null;
            }
        }

        // 从 bookKeys 列表中移除当前 bookKey
        const currentBookKeys = readerStore.getBookKeys();
        const updatedBookKeys = currentBookKeys.filter((key) => key !== bookKey);
        readerStore.setBookKeys(updatedBookKeys);

        if (viewElement) {
            viewElement.removeEventListener('relocate', handleProgressRelocate);
            viewElement.removeEventListener('load', handleDocLoad);
            // 清理 renderer relocate 事件监听器
            if (
                viewElement.renderer?.removeEventListener &&
                (viewElement as any)._rendererRelocateHandler
            ) {
                viewElement.renderer.removeEventListener(
                    'relocate',
                    (viewElement as any)._rendererRelocateHandler
                );
            }
            viewElement.close();
            viewElement.remove();
        }

        // 调用 bookDoc.destroy() 如果存在（bookDoc 可能被其他视图共享，但 destroy 方法应该安全）
        if (bookDoc?.destroy) {
            try {
                bookDoc.destroy();
            } catch (error) {
                console.warn('Error calling bookDoc.destroy():', error);
            }
        }

        // 清理 sidebarStore 的 sideBarBookKey（如果匹配当前 bookKey）
        if (sidebarStore.getSideBarBookKey() === bookKey) {
            sidebarStore.setSideBarBookKey(null);
        }

        readerStore.clearViewState(bookKey);
    });
</script>

<div bind:this={containerRef} class="foliate-viewer flex h-full w-full flex-col overflow-hidden">
    {#if error}
        <div class="flex h-full items-center justify-center">
            <div class="text-center">
                <p class="text-destructive text-lg font-semibold">加载失败</p>
                <p class="text-muted-foreground text-sm">{error}</p>
            </div>
        </div>
    {:else if loading}
        <div class="flex h-full items-center justify-center">
            <div class="text-center">
                <div
                    class="border-primary inline-block h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
                ></div>
                <p class="text-muted-foreground mt-4 text-sm">正在加载书籍...</p>
            </div>
        </div>
    {:else if viewState}
        <!-- 外层 flex-row 容器：Sidebar 与整个内容区域并排显示 -->
        <div
            class="flex min-h-0 flex-1 flex-row overflow-hidden transition-all duration-300 ease-in-out"
        >
            {#if sidebarPinned}
                <!-- Sidebar 直接在 flex 容器内渲染，noPortal={true}，不使用 Portal -->
                <!-- 始终渲染，通过 isVisible 控制宽度实现过渡 -->
                <div class="flex-shrink-0 overflow-hidden">
                    <Sidebar {bookKey} {book} />
                </div>
            {/if}

            <!-- 右侧内容区域：HeaderBar + view + FooterBar -->
            <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                <!-- HeaderBar -->
                {#if headerVisible}
                    <HeaderBar {bookKey} {book} isVisible={headerVisible} />
                {/if}

                <!-- 内容区域 -->
                <div
                    class="foliate-view-container bg-card relative h-full"
                    bind:this={viewContainerRef}
                >
                    <!-- foliate-view 将通过 JavaScript 动态添加到这里 -->
                </div>
                <!-- FooterBar -->
                {#if footerVisible && viewState.progress}
                    <FooterBar
                        {bookKey}
                        {book}
                        section={viewState.progress.section}
                        pageinfo={viewState.progress.pageinfo}
                        timeinfo={viewState.progress.timeinfo}
                        isVisible={footerVisible}
                    />
                {/if}
            </div>
        </div>
    {/if}

    <!-- Sidebar (未 pinned 时，noPortal={false}，使用 Portal 渲染到 body) -->
    {#if viewState && !error && !loading && !(sidebarPinned && sidebarVisible)}
        <Sidebar {bookKey} {book} />
    {/if}

    <!-- Annotator (文本选择和标注) -->
    {#if viewState && !error && !loading && viewState.inited}
        <Annotator {bookKey} />
    {/if}

    <!-- SettingsDialog (设置对话框) -->
    {#if viewState && !error && !loading}
        <SettingsDialog {bookKey} />
    {/if}
</div>

<style>
    :global(foliate-view) {
        width: 100%;
        height: 100%;
        display: block;
        background-color: hsl(var(--background));
    }

    /* 通过 part 选择器样式化 Shadow DOM 内部的 container */
    :global(foliate-view::part(container)) {
        max-width: 100%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--color-card-foreground) var(--color-card);
    }

    /* 确保文档元素存在 */
    :global(foliate-paginator iframe[src]) {
        display: block;
    }
</style>
