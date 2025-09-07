import { goto } from '$app/navigation';
import { page } from '$app/state';
import { redirect } from '@sveltejs/kit';

export type Pages = 'home' | 'settings' | 'bg_settings' | 'reader_home' | 'reader_add';

export const RouteMap: Record<Pages, string> = {
	home: '/',
	settings: '/settings/',
	bg_settings: '/settings/background',
	reader_home: '/reader',
	reader_add: '/reader/add'
};

// 页面历史记录
let pageHistory = $state<string[]>([]);
let currentIndex = $state(-1);

// 初始化历史记录
function initHistory() {
	if (typeof window !== 'undefined') {
		// 这里只做基本的初始化
		const currentPath = page.url.pathname;
		if (pageHistory.length === 0) {
			pageHistory.push(currentPath);
			currentIndex = 0;
		}
	}
}

// 初始化历史记录
if (typeof window !== 'undefined') {
	initHistory();
}

// 更新页面历史记录的函数
export function updatePageHistory(currentPath: string) {
	// 如果是新的导航（不是返回操作）
	if (currentIndex === -1 || pageHistory[currentIndex] !== currentPath) {
		// 如果当前不在历史记录末尾，清除后面的记录
		if (currentIndex < pageHistory.length - 1) {
			pageHistory = pageHistory.slice(0, currentIndex + 1);
		}

		// 添加新页面到历史记录
		pageHistory.push(currentPath);
		currentIndex = pageHistory.length - 1;
	}
}

export function goBack() {
	if (currentIndex > 0) {
		currentIndex--;
		const previousPath = pageHistory[currentIndex];
		goto(previousPath, { replaceState: true });
	} else {
		// 如果没有历史记录，返回首页
		goHome();
	}
}
export function redirectBack() {
	if (currentIndex > 0) {
		currentIndex--;
		const previousPath = pageHistory[currentIndex];
		redirect(302, previousPath);
	} else {
		// 如果没有历史记录，返回首页
		redirectHome();
	}
}

export function goHome() {
	goto(RouteMap.home);
}

export function redirectHome() {
	redirect(302, RouteMap.home);
}

export type SettingsTab = 'base' | 'theme' | 'reader';

export function goSettings(tab: SettingsTab = 'base') {
	goto(RouteMap.settings, { state: { tab } });
}

export type BgSettingsTab = 'golbal' | 'overlay' | 'custom';

export function goBgSettings(tab: BgSettingsTab = 'golbal') {
	goto(RouteMap.bg_settings, { state: { tab } });
}

export function goReaderHome() {
	goto(RouteMap.reader_home);
}

export function redirectReaderHome() {
	redirect(302, RouteMap.reader_home);
}

export function getReadBookUrl(bookId: number) {
	return `${RouteMap.reader_home}/${bookId}`;
}

export function goReadBook(bookId: number) {
	goto(getReadBookUrl(bookId));
}

export function goReadFsBook(bookPath: string, goRead?: boolean) {
	goto(`${RouteMap.reader_home}/fs/${bookPath}?goRead=${goRead ?? false}`);
}

export function goReaderBatchAddPaths(paths: string[]) {
	goto(RouteMap.reader_add, { state: { paths } });
}

// 获取当前页面路径
export function getCurrentPath(): string {
	return page.url.pathname;
}

// 检查是否可以返回
export function canGoBack(): boolean {
	return currentIndex > 0;
}

// 获取历史记录长度
export function getHistoryLength(): number {
	return pageHistory.length;
}

// 获取历史记录（只读）
export function getPageHistory(): readonly string[] {
	return pageHistory;
}

// 清空历史记录
export function clearHistory() {
	pageHistory = [];
	currentIndex = -1;
}
