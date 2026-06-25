import AppIcon from '$lib/components/common/app-icon.svelte';
import type { TitleBarIconId } from '$lib/settings/Layout';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Command,
    Fullscreen,
    House,
    Maximize2,
    Minus,
    Moon,
    Move,
    Pin,
    RefreshCcw,
    Settings,
    Wallpaper,
    X,
    ZoomIn
} from 'lucide-svelte';

export type TitleBarIconDefinition = {
    id: TitleBarIconId;
    label: string;
    component: any;
};

export const titleBarIconDefinitions: TitleBarIconDefinition[] = [
    { id: 'app', label: '应用', component: AppIcon },
    { id: 'arrow-left', label: '返回', component: ArrowLeft },
    { id: 'chevron-left', label: '左箭头', component: ChevronLeft },
    { id: 'chevron-right', label: '右箭头', component: ChevronRight },
    { id: 'close', label: '关闭', component: X },
    { id: 'command', label: '命令', component: Command },
    { id: 'fullscreen', label: '全屏', component: Fullscreen },
    { id: 'home', label: '主页', component: House },
    { id: 'max', label: '最大化', component: Maximize2 },
    { id: 'min', label: '最小化', component: Minus },
    { id: 'move', label: '拖拽', component: Move },
    { id: 'pin', label: '置顶', component: Pin },
    { id: 'refresh', label: '刷新', component: RefreshCcw },
    { id: 'settings', label: '设置', component: Settings },
    { id: 'theme', label: '主题', component: Moon },
    { id: 'wallpaper', label: '背景', component: Wallpaper },
    { id: 'zoom', label: '缩放', component: ZoomIn }
];

export const titleBarIconMap = new Map(
    titleBarIconDefinitions.map((definition) => [definition.id, definition])
);

export const titleBarContributionDefaultIconIds = new Map<string, TitleBarIconId>([
    ['app.icon', 'app'],
    ['app.zoom', 'zoom'],
    ['app.themeToggle', 'theme'],
    ['window.dragRegion', 'move'],
    ['navigate.home', 'home'],
    ['navigate.back', 'arrow-left'],
    ['navigate.settings', 'settings'],
    ['navigate.backgroundSettings', 'wallpaper'],
    ['window.refresh', 'refresh'],
    ['window.toggleAlwaysOnTop', 'pin'],
    ['window.toggleFullscreen', 'fullscreen'],
    ['window.minimize', 'min'],
    ['window.maximize', 'max'],
    ['window.close', 'close']
]);

export function getTitleBarIcon(iconId: TitleBarIconId | undefined): any {
    if (!iconId) return undefined;
    return titleBarIconMap.get(iconId)?.component;
}

export function getDefaultTitleBarIconId(contributionId: string): TitleBarIconId | undefined {
    return titleBarContributionDefaultIconIds.get(contributionId);
}
