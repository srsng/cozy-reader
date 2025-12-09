/**
 * ParallelViewStore - 并行视图存储
 * 管理并行视图的同步状态
 */

import { writable, type Writable, get } from 'svelte/store';

/**
 * 并行视图状态接口
 */
interface ParallelViewState {
    /** 并行视图组列表，每个组是一个 Set<string>，包含同步的 bookKey */
    parallelViews: Set<string>[];
}

/**
 * 创建初始状态
 */
function createInitialState(): ParallelViewState {
    return {
        parallelViews: [],
    };
}

/**
 * ParallelViewStore 类
 * 提供并行视图管理和同步功能
 */
class ParallelViewStore {
    private store: Writable<ParallelViewState>;

    constructor() {
        const initialState = createInitialState();
        this.store = writable(initialState);
    }

    /**
     * 订阅状态变化
     */
    subscribe(callback: (state: ParallelViewState) => void): () => void {
        return this.store.subscribe(callback);
    }

    /**
     * 设置并行视图组
     * @param bookKeys 要同步的 bookKey 数组
     */
    setParallel(bookKeys: string[]): void {
        if (bookKeys.length === 0) {
            this.store.update((state) => ({
                ...state,
                parallelViews: [],
            }));
            return;
        }

        this.store.update((state) => {
            // 移除包含这些 bookKey 的现有组
            const newGroups = state.parallelViews.filter(
                (group) => !bookKeys.some((key) => group.has(key))
            );

            // 添加新组
            if (bookKeys.length > 1) {
                newGroups.push(new Set(bookKeys));
            }

            return {
                ...state,
                parallelViews: newGroups,
            };
        });
    }

    /**
     * 取消并行视图
     * @param bookKey 要取消的 bookKey
     */
    unsetParallel(bookKey: string): void {
        this.store.update((state) => {
            const newGroups = state.parallelViews.filter((group) => {
                if (group.has(bookKey)) {
                    group.delete(bookKey);
                    return group.size > 1; // 只保留有多个 bookKey 的组
                }
                return true;
            });

            return {
                ...state,
                parallelViews: newGroups,
            };
        });
    }

    /**
     * 检查两个 bookKey 是否在同一个并行组中
     * @param bookKey1 第一个 bookKey
     * @param bookKey2 第二个 bookKey
     * @returns 是否在同一个并行组中
     */
    isParallel(bookKey1: string, bookKey2: string): boolean {
        return get(this.store).parallelViews.some(
            (group) => group.has(bookKey1) && group.has(bookKey2)
        );
    }

    /**
     * 获取指定 bookKey 的并行视图组
     * @param bookKey bookKey
     * @returns 并行视图组，如果没有则返回 null
     */
    getParallels(bookKey: string): Set<string> | null {
        return (
            get(this.store).parallelViews.find((group) => group.has(bookKey)) || null
        );
    }

    /**
     * 获取所有并行视图组
     * @returns 所有并行视图组
     */
    getAllParallels(): Set<string>[] {
        return get(this.store).parallelViews;
    }
}

// 创建单例实例
export const parallelViewStore = new ParallelViewStore();
