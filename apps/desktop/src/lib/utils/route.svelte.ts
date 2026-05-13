import { goto } from '$app/navigation';
import { page } from '$app/state';
import { redirect } from '@sveltejs/kit';
import type { AfterNavigate } from '@sveltejs/kit';

export type Pages = 'home' | 'settings' | 'bg_settings' | 'reader_home' | 'reader_add';

export const RouteMap: Record<Pages, string> = {
    home: '/',
    settings: '/settings/',
    bg_settings: '/settings/background',
    reader_home: '/reader',
    reader_add: '/reader/add'
};

export type RouteHistoryEntry = {
    id: number;
    url: string;
    stateId: number;
    skipOnBack: boolean;
};

export type AppNavigateOptions = {
    skipOnBack?: boolean;
    replaceState?: boolean;
    state?: App.PageState;
};

type PendingNavigationOptions = {
    url: string;
    skipOnBack: boolean;
    replaceState: boolean;
    stateId: number;
};

type RouteState = {
    routeHistoryId?: number;
};

let pageHistory = $state<RouteHistoryEntry[]>([]);
let currentIndex = $state(-1);
let nextHistoryId = 1;
let pendingNavigationOptions: PendingNavigationOptions | null = null;

function toRouteUrl(url: URL | string): string {
    const parsedUrl =
        typeof url === 'string'
            ? new URL(
                  url,
                  typeof window === 'undefined' ? 'http://localhost' : window.location.href
              )
            : url;

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

function getStateId(state: App.PageState | null | undefined): number {
    const routeHistoryId = (state as RouteState | null | undefined)?.routeHistoryId;
    return typeof routeHistoryId === 'number' ? routeHistoryId : 0;
}

function createStateId(): number {
    return nextHistoryId++;
}

function createHistoryEntry(url: string, stateId: number, skipOnBack = false): RouteHistoryEntry {
    return {
        id: createStateId(),
        url,
        stateId,
        skipOnBack
    };
}

function initHistory() {
    if (typeof window !== 'undefined' && pageHistory.length === 0) {
        pageHistory.push(createHistoryEntry(toRouteUrl(page.url), getStateId(page.state), false));
        currentIndex = 0;
    }
}

if (typeof window !== 'undefined') {
    initHistory();
}

export function updatePageHistory(currentUrl: string | URL, navigation?: AfterNavigate) {
    const url = toRouteUrl(currentUrl);
    const pendingOptions = pendingNavigationOptions;
    pendingNavigationOptions = null;
    const pendingMatchesCurrentUrl = pendingOptions?.url === url;
    const currentStateId = getStateId(page.state);
    const fromUrl = navigation?.from?.url ? toRouteUrl(navigation.from.url) : null;

    if (
        currentIndex >= 0 &&
        pageHistory[currentIndex]?.url === url &&
        pageHistory[currentIndex]?.stateId === currentStateId
    ) {
        if (pendingOptions?.replaceState && pendingMatchesCurrentUrl) {
            pageHistory[currentIndex] = {
                ...pageHistory[currentIndex],
                skipOnBack: pendingOptions.skipOnBack,
                stateId: pendingOptions.stateId || currentStateId
            };
        }
        return;
    }

    if (
        pendingOptions &&
        !pendingMatchesCurrentUrl &&
        currentIndex >= 0 &&
        pageHistory[currentIndex]?.url === url
    ) {
        return;
    }

    if (navigation?.type === 'popstate' && navigation.delta !== undefined) {
        const targetIndex = currentIndex + navigation.delta;

        if (targetIndex >= 0 && targetIndex < pageHistory.length) {
            currentIndex = targetIndex;
            return;
        }
    }

    const existingIndex = findHistoryIndex(url, currentStateId, currentIndex);

    if (
        navigation?.type === 'goto' &&
        fromUrl !== null &&
        currentIndex >= 0 &&
        pageHistory[currentIndex]?.url === fromUrl &&
        pageHistory[currentIndex].skipOnBack &&
        existingIndex !== -1 &&
        existingIndex < currentIndex
    ) {
        currentIndex = existingIndex;
        return;
    }

    if (pendingOptions?.replaceState && pendingMatchesCurrentUrl && currentIndex >= 0) {
        pageHistory[currentIndex] = {
            ...pageHistory[currentIndex],
            url,
            skipOnBack: pendingOptions.skipOnBack,
            stateId: pendingOptions.stateId || currentStateId
        };
        return;
    }

    if (currentIndex < pageHistory.length - 1) {
        pageHistory = pageHistory.slice(0, currentIndex + 1);
    }

    pageHistory.push(
        createHistoryEntry(
            url,
            pendingMatchesCurrentUrl ? pendingOptions.stateId : currentStateId,
            pendingMatchesCurrentUrl ? pendingOptions.skipOnBack : false
        )
    );
    currentIndex = pageHistory.length - 1;
}

function findHistoryIndex(url: string, stateId: number, fromIndex: number): number {
    if (fromIndex >= 0) {
        for (let index = fromIndex - 1; index >= 0; index--) {
            if (pageHistory[index].url === url && pageHistory[index].stateId === stateId)
                return index;
        }

        for (let index = fromIndex + 1; index < pageHistory.length; index++) {
            if (pageHistory[index].url === url && pageHistory[index].stateId === stateId)
                return index;
        }
    }

    for (let index = pageHistory.length - 1; index >= 0; index--) {
        if (pageHistory[index].url === url && pageHistory[index].stateId === stateId) return index;
    }

    return -1;
}

function getBackTargetIndex(): number {
    for (let index = currentIndex - 1; index >= 0; index--) {
        if (!pageHistory[index].skipOnBack) return index;
    }

    return -1;
}

function markPendingNavigation(url: string | URL, options?: AppNavigateOptions): number {
    const stateId = createStateId();
    pendingNavigationOptions = {
        url: toRouteUrl(url),
        skipOnBack: options?.skipOnBack ?? false,
        replaceState: options?.replaceState ?? false,
        stateId
    };

    return stateId;
}

function withRouteHistoryState(state: App.PageState | undefined, stateId: number): App.PageState {
    return {
        ...(state ?? {}),
        routeHistoryId: stateId
    };
}

export function goRoute(url: string | URL, options?: AppNavigateOptions) {
    const stateId = markPendingNavigation(url, options);
    return goto(url, {
        replaceState: options?.replaceState,
        state: withRouteHistoryState(options?.state, stateId)
    });
}

export function goBack(fallback = RouteMap.home) {
    const targetIndex = getBackTargetIndex();

    if (targetIndex !== -1 && typeof window !== 'undefined') {
        window.history.go(-(currentIndex - targetIndex));
    } else {
        goRoute(fallback, { replaceState: true });
    }
}

export function redirectBack(fallback = RouteMap.home) {
    const targetIndex = getBackTargetIndex();

    if (targetIndex !== -1) {
        redirect(302, pageHistory[targetIndex].url);
    } else {
        redirect(302, fallback);
    }
}

export function goHome() {
    goRoute(RouteMap.home);
}

export function redirectHome() {
    redirect(302, RouteMap.home);
}

export type SettingsTab = 'base' | 'theme' | 'reader';

export function goSettings(tab: SettingsTab = 'base') {
    goRoute(RouteMap.settings, { state: { tab } });
}

export type BgSettingsTab = 'golbal' | 'overlay' | 'custom';

export function goBgSettings(tab: BgSettingsTab = 'golbal') {
    goRoute(RouteMap.bg_settings, { state: { tab } });
}

export function goReaderHome() {
    goRoute(RouteMap.reader_home);
}

export function redirectReaderHome() {
    redirect(302, RouteMap.reader_home);
}

export function getReadBookUrl(bookId: number) {
    return `${RouteMap.reader_home}/${bookId}`;
}

export function goReadBook(bookId: number) {
    goRoute(getReadBookUrl(bookId));
}

export function goReadFsBook(bookPath: string, goRead?: boolean) {
    const url = new URL(`${RouteMap.reader_home}/fs/${bookPath}`, window.location.href);
    url.searchParams.set('goRead', String(goRead ?? false));
    url.searchParams.set('returnTo', getCurrentPath());

    goRoute(toRouteUrl(url), { skipOnBack: true });
}

export function goReaderBatchAddPaths(paths: string[]) {
    goRoute(RouteMap.reader_add, { state: { paths }, skipOnBack: true });
}

// 获取当前页面路径
export function getCurrentPath(): string {
    return toRouteUrl(page.url);
}

export function getCurrentPathname(): string {
    return page.url.pathname;
}

// 检查是否可以返回
export function canGoBack(): boolean {
    return getBackTargetIndex() !== -1;
}

// 获取历史记录长度
export function getHistoryLength(): number {
    return pageHistory.length;
}

export function getCurrentHistoryIndex(): number {
    return currentIndex;
}

// 获取历史记录（只读）
export function getPageHistory(): readonly RouteHistoryEntry[] {
    return pageHistory;
}

// 清空历史记录
export function clearHistory() {
    pageHistory = [createHistoryEntry(toRouteUrl(page.url), getStateId(page.state))];
    currentIndex = 0;
}
