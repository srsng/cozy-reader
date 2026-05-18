import type { MenuContribution } from '$lib/menus';
import { MenuId, type MenuService } from '$lib/menus';
import AppIconButton from './util-btn/app-icon.svelte';
import AppTitleButton from './util-btn/app-title.svelte';
import AppDragButton from './util-btn/app-drag.svelte';
import ThemeToggleButton from './util-btn/theme-toggle.svelte';
import ZoomButton from './util-btn/zoom-popover.svelte';
import { getCommandInvocationKey } from '$lib/commands/invocation';
import type { TitleBarIconId } from '$lib/settings/Layout';
import { getDefaultTitleBarIconId, getTitleBarIcon } from './titlebarIcons';

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
    iconId?: TitleBarIconId;
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
        iconId: 'app',
        icon: getTitleBarIcon('app')
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
        iconId: 'zoom',
        icon: getTitleBarIcon('zoom')
    },
    {
        id: 'app.themeToggle',
        title: '主题切换',
        kind: 'component',
        order: 30,
        category: 'theme',
        component: ThemeToggleButton,
        iconId: 'theme',
        icon: getTitleBarIcon('theme')
    },
    {
        id: 'window.dragRegion',
        title: '拖拽区域',
        kind: 'component',
        order: 40,
        category: 'window',
        component: AppDragButton,
        iconId: 'move',
        icon: getTitleBarIcon('move')
    }
];

export const staticTitleBarContributionMap = new Map(
    staticTitleBarContributions.map((contribution) => [contribution.id, contribution])
);

export function getTitleBarContribution(
    id: string,
    menuService: MenuService
): TitleBarContribution | undefined {
    const staticContribution = staticTitleBarContributionMap.get(id);
    if (staticContribution) return staticContribution;

    const menuContribution =
        menuService.getItem(MenuId.TitleBar, id) ?? getMenuContributionById(menuService, id);
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

export function getTitleBarCommandCandidates(menuService: MenuService): TitleBarContribution[] {
    const byId = new Map<string, TitleBarContribution>();

    for (const menuContribution of getMenuContributions(menuService)) {
        if (byId.has(menuContribution.id)) continue;
        byId.set(menuContribution.id, menuContributionToTitleBarContribution(menuContribution));
    }

    return Array.from(byId.values()).sort(
        (left, right) => left.order - right.order || left.title.localeCompare(right.title)
    );
}

function menuContributionToTitleBarContribution(
    contribution: MenuContribution
): TitleBarContribution {
    const iconId = getDefaultTitleBarIconId(contribution.id);

    return {
        id: contribution.id,
        title: contribution.title,
        description: contribution.description,
        kind: 'menu',
        order: contribution.order ?? 0,
        category: contribution.category === 'reader' ? 'application' : contribution.category,
        iconId,
        icon: getTitleBarIcon(iconId),
        menuContribution: contribution,
        destructive: contribution.id === 'window.close',
        hideWhenDisabled: shouldHideWhenDisabled(contribution)
    };
}

function shouldHideWhenDisabled(contribution: MenuContribution): boolean {
    return getCommandInvocationKey(contribution.invocation) === 'navigate.back';
}

function getMenuContributions(menuService: MenuService): MenuContribution[] {
    return [MenuId.TitleBar, MenuId.CommandPalette, MenuId.Reader, MenuId.Settings].flatMap(
        (menu) => menuService.getItems(menu)
    );
}

function getMenuContributionById(
    menuService: MenuService,
    id: string
): MenuContribution | undefined {
    return getMenuContributions(menuService).find((contribution) => contribution.id === id);
}
