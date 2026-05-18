import type { MenuContribution } from '$lib/menus';
import { MenuId, type MenuService } from '$lib/menus';
import AppIconButton from './util-btn/app-icon.svelte';
import AppTitleButton from './util-btn/app-title.svelte';
import AppDragButton from './util-btn/app-drag.svelte';
import ThemeToggleButton from './util-btn/theme-toggle.svelte';
import ZoomButton from './util-btn/zoom-popover.svelte';
import AppIcon from '$lib/components/common/app-icon.svelte';
import { getCommandInvocationKey } from '$lib/commands/invocation';
import {
    ArrowLeft,
    Fullscreen,
    Home,
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

export type TitleBarContributionKind = 'menu' | 'component';

export type TitleBarContribution = {
    id: string;
    title: string;
    description?: string;
    kind: TitleBarContributionKind;
    order: number;
    category: 'application' | 'navigation' | 'window' | 'zoom' | 'theme' | 'legacy';
    component?: any;
    icon?: any;
    menuContribution?: MenuContribution;
    destructive?: boolean;
    hideWhenDisabled?: boolean;
    text?: boolean;
};

export type TitleBarContributionRenderProps = {
    appTitle: string;
    className?: string;
    iconClass?: string;
    disabled?: boolean;
    variant?: string;
    size?: string;
};

export const staticTitleBarContributions: TitleBarContribution[] = [
    {
        id: 'app.icon',
        title: '应用图标',
        kind: 'component',
        order: 0,
        category: 'application',
        component: AppIconButton,
        icon: AppIcon
    },
    {
        id: 'app.title',
        title: '应用标题',
        kind: 'component',
        order: 1,
        category: 'application',
        component: AppTitleButton,
        text: true
    },
    {
        id: 'app.zoom',
        title: '缩放',
        kind: 'component',
        order: 20,
        category: 'zoom',
        component: ZoomButton,
        icon: ZoomIn
    },
    {
        id: 'app.themeToggle',
        title: '主题切换',
        kind: 'component',
        order: 30,
        category: 'theme',
        component: ThemeToggleButton,
        icon: Moon
    },
    {
        id: 'window.dragRegion',
        title: '拖拽区域',
        kind: 'component',
        order: 40,
        category: 'window',
        component: AppDragButton,
        icon: Move
    }
];

const titleBarActionIcons = new Map<string, any>([
    ['navigate.home', Home],
    ['navigate.back', ArrowLeft],
    ['navigate.settings', Settings],
    ['navigate.backgroundSettings', Wallpaper],
    ['window.refresh', RefreshCcw],
    ['window.toggleAlwaysOnTop', Pin],
    ['window.toggleFullscreen', Fullscreen],
    ['window.minimize', Minus],
    ['window.maximize', Maximize2],
    ['window.close', X]
]);

export const staticTitleBarContributionMap = new Map(
    staticTitleBarContributions.map((contribution) => [contribution.id, contribution])
);

export function getTitleBarContribution(
    id: string,
    menuService: MenuService
): TitleBarContribution | undefined {
    const staticContribution = staticTitleBarContributionMap.get(id);
    if (staticContribution) return staticContribution;

    const menuContribution = menuService.getItem(MenuId.TitleBar, id);
    if (!menuContribution) return undefined;

    return menuContributionToTitleBarContribution(menuContribution);
}

export function getAvailableTitleBarContributions(
    menuService: MenuService
): TitleBarContribution[] {
    return [
        ...staticTitleBarContributions,
        ...menuService.getItems(MenuId.TitleBar).map(menuContributionToTitleBarContribution)
    ].sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
}

function menuContributionToTitleBarContribution(
    contribution: MenuContribution
): TitleBarContribution {
    return {
        id: contribution.id,
        title: contribution.title,
        description: contribution.description,
        kind: 'menu',
        order: contribution.order ?? 0,
        category: contribution.category === 'reader' ? 'application' : contribution.category,
        icon: titleBarActionIcons.get(contribution.id),
        menuContribution: contribution,
        destructive: contribution.id === 'window.close',
        hideWhenDisabled: shouldHideWhenDisabled(contribution)
    };
}

function shouldHideWhenDisabled(contribution: MenuContribution): boolean {
    return getCommandInvocationKey(contribution.invocation) === 'navigate.back';
}
