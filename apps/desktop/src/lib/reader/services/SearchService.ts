/**
 * SearchService - 搜索服务
 * 提供全文搜索、结果高亮和搜索导航功能
 */

import type {
    FoliateViewElement,
    BookSearchConfig,
    BookSearchResult,
    BookSearchMatch
} from '../types';

/**
 * 搜索服务类
 */
export class SearchService {
    /**
     * 执行搜索
     * @param view foliate-view 实例
     * @param config 搜索配置
     * @returns 异步生成器，产生搜索结果或进度字符串
     */
    async *search(
        view: FoliateViewElement,
        config: BookSearchConfig
    ): AsyncGenerator<BookSearchResult | string, void, unknown> {
        if (!config.query) {
            return;
        }

        try {
            // 根据 scope 决定是否传递 index
            // scope === 'section' 时传递 index，scope === 'book' 时传递 undefined
            const searchOpts: {
                query: string;
                index?: number;
                matchCase?: boolean;
                matchWholeWords?: boolean;
                matchDiacritics?: boolean;
            } = {
                query: config.query,
                matchCase: config.matchCase,
                matchWholeWords: config.matchWholeWords,
                matchDiacritics: config.matchDiacritics
            };

            // 只在 section 搜索模式下传递 index
            if (config.scope === 'section' && config.index !== undefined) {
                searchOpts.index = config.index;
            }

            const generator = view.search(searchOpts);

            for await (const result of generator) {
                yield result;
            }
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    /**
     * 清除搜索高亮
     */
    clearSearch(view: FoliateViewElement): void {
        try {
            view.clearSearch();
        } catch (error) {
            console.error('Failed to clear search:', error);
        }
    }

    /**
     * 高亮搜索结果
     * 导航到指定结果并高亮显示
     * 使用 showAnnotation 方法以确保正确高亮显示
     */
    async highlightResult(view: FoliateViewElement, result: BookSearchMatch): Promise<void> {
        try {
            // foliate-js 使用 SEARCH_PREFIX + cfi 格式的 annotation value
            // SEARCH_PREFIX 是 'foliate-search:'
            const annotation = { value: `foliate-search:${result.cfi}` };
            await view.showAnnotation(annotation);
        } catch (error) {
            console.error('Failed to highlight result:', error);
        }
    }

    /**
     * 导航到下一个搜索结果
     */
    async goToNextResult(view: FoliateViewElement): Promise<void> {
        try {
            await view.next();
        } catch (error) {
            console.error('Failed to go to next result:', error);
        }
    }

    /**
     * 导航到上一个搜索结果
     */
    async goToPrevResult(view: FoliateViewElement): Promise<void> {
        try {
            await view.prev();
        } catch (error) {
            console.error('Failed to go to prev result:', error);
        }
    }
}

// 导出单例实例
export const searchService = new SearchService();
