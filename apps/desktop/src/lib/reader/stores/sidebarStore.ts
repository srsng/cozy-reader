/**
 * SidebarStore - 侧边栏状态管理
 * 管理侧边栏显示/隐藏、当前标签页和搜索状态
 */

import { writable, type Writable, get } from 'svelte/store';

/**
 * 侧边栏标签页类型
 */
export type SidebarTab = 'toc' | 'search' | 'notes';

/**
 * SidebarStore 状态接口
 */
interface SidebarStoreState {
    /** 侧边栏是否可见 */
    isVisible: boolean;
    /** 当前标签页 */
    currentTab: SidebarTab;
    /** 搜索关键词 */
    searchTerm: string;
    /** 是否固定侧边栏 */
    isPinned: boolean;
    /** 当前侧边栏关联的 bookKey */
    sideBarBookKey: string | null;
}

/**
 * 创建初始状态
 */
function createInitialState(): SidebarStoreState {
    return {
        isVisible: false,
        currentTab: 'toc',
        searchTerm: '',
        isPinned: false,
        sideBarBookKey: null,
    };
}

/**
 * SidebarStore 类
 * 提供侧边栏状态管理
 */
class SidebarStore {
    private store: Writable<SidebarStoreState>;

    constructor() {
        const initialState = createInitialState();
        this.store = writable(initialState);
    }

    /**
     * 订阅状态变化
     */
    subscribe(callback: (state: SidebarStoreState) => void): () => void {
        return this.store.subscribe(callback);
    }

    /**
     * 设置侧边栏可见性
     */
    setVisible(visible: boolean): void {
        this.store.update((state) => ({
            ...state,
            isVisible: visible,
        }));
    }

    /**
     * 获取侧边栏可见性
     */
    getVisible(): boolean {
        return get(this.store).isVisible;
    }

    /**
     * 切换侧边栏可见性
     */
    toggle(): void {
        this.setVisible(!get(this.store).isVisible);
    }

    /**
     * 设置当前标签页
     */
    setCurrentTab(tab: SidebarTab): void {
        this.store.update((state) => ({
            ...state,
            currentTab: tab,
            // 切换到搜索标签页时自动显示侧边栏
            isVisible: tab === 'search' ? true : state.isVisible,
        }));
    }

    /**
     * 获取当前标签页
     */
    getCurrentTab(): SidebarTab {
        return get(this.store).currentTab;
    }

    /**
     * 设置搜索关键词
     */
    setSearchTerm(term: string): void {
        this.store.update((state) => ({
            ...state,
            searchTerm: term,
        }));
    }

    /**
     * 获取搜索关键词
     */
    getSearchTerm(): string {
        return get(this.store).searchTerm;
    }

    /**
     * 设置固定状态
     */
    setPinned(pinned: boolean): void {
        this.store.update((state) => ({
            ...state,
            isPinned: pinned,
        }));
    }

    /**
     * 获取固定状态
     */
    getPinned(): boolean {
        return get(this.store).isPinned;
    }

    /**
     * 切换固定状态
     */
    togglePinned(): void {
        this.setPinned(!get(this.store).isPinned);
    }

    /**
     * 设置侧边栏关联的 bookKey
     */
    setSideBarBookKey(bookKey: string | null): void {
        this.store.update((state) => ({
            ...state,
            sideBarBookKey: bookKey,
        }));
    }

    /**
     * 获取侧边栏关联的 bookKey
     */
    getSideBarBookKey(): string | null {
        return get(this.store).sideBarBookKey;
    }
}

export const sidebarStore = new SidebarStore();
