export interface LayoutSettings {
    titlebar: boolean;
    header: boolean;
    footer: boolean;
    layoutConfigs: LayoutConfigs;
}

export interface LayoutConfigs {
    titlebar: BarConfig;
    footbar: BarConfig;
    sidebar: BarConfig;
}

export type BarSection = 'left' | 'center' | 'right';
export type TitleBarContributionId = string;
export type TitleBarIconId =
    | 'app'
    | 'arrow-left'
    | 'chevron-left'
    | 'chevron-right'
    | 'close'
    | 'command'
    | 'fullscreen'
    | 'home'
    | 'max'
    | 'min'
    | 'move'
    | 'pin'
    | 'refresh'
    | 'settings'
    | 'theme'
    | 'wallpaper'
    | 'zoom';

export interface TitleBarItemConfig {
    id: string;
    contributionId: TitleBarContributionId;
    enabled: boolean;
    order: number;
    iconId?: TitleBarIconId;
    titleOverride?: string;
}

export interface BarConfig {
    left: TitleBarItemConfig[];
    center: TitleBarItemConfig[];
    right: TitleBarItemConfig[];
}

export type ButtonConfig = TitleBarItemConfig;

export type LegacyButtonConfig = {
    name?: string;
    type?: ButtonType;
    enabled?: boolean;
    order?: number;
    mode?: undefined | 'icon' | 'text';
    customProps?: Record<string, any>;
    contributionId?: string;
    id?: string;
    iconId?: TitleBarIconId;
    titleOverride?: string;
};

export type LegacyBarConfig = {
    left?: LegacyButtonConfig[];
    center?: LegacyButtonConfig[];
    right?: LegacyButtonConfig[];
};

export type TitleBarItemMoveTarget = {
    section: BarSection;
    index: number;
};

export type TitleBarContributionLayoutDescriptor = {
    id: TitleBarContributionId;
    order?: number;
    category?: string;
    defaultSection?: BarSection;
};

const BAR_SECTIONS: BarSection[] = ['left', 'center', 'right'];

// 定义 enum
export enum ButtonTypeEnum {
    Home = 'home',
    Back = 'back',
    Settings = 'settings',
    BackgroundSettings = 'background-settings',
    Refresh = 'refresh',
    Zoom = 'zoom',
    AppIcon = 'app-icon',
    AppTitle = 'app-title',
    AlwaysOnTop = 'always-on-top',
    Drag = 'drag',
    Minimize = 'minimize',
    Maximize = 'maximize',
    Fullscreen = 'fullscreen',
    Close = 'close',
    ThemeToggle = 'theme-toggle',
    Custom = 'custom'
}

// 从 enum 生成 union type
export type ButtonType = `${ButtonTypeEnum}`;

// 获取所有按钮类型的辅助函数
export const ALL_BUTTON_TYPES = Object.values(ButtonTypeEnum);

// 为了向后兼容，也可以直接使用 enum 值
export const ButtonType = ButtonTypeEnum;

// 按钮类型的名称映射
export const buttonTypeLabels: Record<ButtonType, string> = {
    home: '主页',
    back: '返回',
    settings: '设置',
    refresh: '刷新',
    zoom: '缩放',
    'app-icon': '应用图标',
    'app-title': '应用标题',
    'always-on-top': '置顶',
    drag: '拖拽',
    minimize: '最小化',
    maximize: '最大化',
    fullscreen: '全屏',
    close: '关闭',
    'theme-toggle': '主题切换',
    custom: '自定义',
    'background-settings': '背景设置'
};

export const legacyButtonTypeToContributionId: Record<ButtonType, TitleBarContributionId> = {
    home: 'navigate.home',
    back: 'navigate.back',
    settings: 'navigate.settings',
    'background-settings': 'navigate.backgroundSettings',
    refresh: 'window.refresh',
    zoom: 'app.zoom',
    'app-icon': 'app.icon',
    'app-title': 'app.title',
    'always-on-top': 'window.toggleAlwaysOnTop',
    drag: 'window.dragRegion',
    minimize: 'window.minimize',
    maximize: 'window.maximize',
    fullscreen: 'window.toggleFullscreen',
    close: 'window.close',
    'theme-toggle': 'app.themeToggle',
    custom: 'legacy.custom'
};

const NULLBarConfig: BarConfig = {
    left: [],
    center: [],
    right: []
};

export const DefaultTitleBarConfig: BarConfig = {
    left: [
        {
            id: 'navigate.home',
            contributionId: 'navigate.home',
            enabled: true,
            order: 0
        },
        {
            id: 'navigate.settings',
            contributionId: 'navigate.settings',
            enabled: true,
            order: 1
        },
        {
            id: 'navigate.backgroundSettings',
            contributionId: 'navigate.backgroundSettings',
            enabled: true,
            order: 2
        },
        {
            id: 'window.refresh',
            contributionId: 'window.refresh',
            enabled: true,
            order: 3
        },
        {
            id: 'app.zoom',
            contributionId: 'app.zoom',
            enabled: true,
            order: 4
        },
        {
            id: 'navigate.back',
            contributionId: 'navigate.back',
            enabled: true,
            order: 999
        }
    ],
    center: [
        {
            id: 'app.icon',
            contributionId: 'app.icon',
            enabled: true,
            order: 0
        },
        {
            id: 'app.title',
            contributionId: 'app.title',
            enabled: true,
            order: 1
        }
    ],
    right: [
        {
            id: 'app.themeToggle',
            contributionId: 'app.themeToggle',
            enabled: true,
            order: 0
        },
        {
            id: 'window.toggleAlwaysOnTop',
            contributionId: 'window.toggleAlwaysOnTop',
            enabled: true,
            order: 1
        },
        {
            id: 'window.minimize',
            contributionId: 'window.minimize',
            enabled: true,
            order: 2
        },
        {
            id: 'window.maximize',
            contributionId: 'window.maximize',
            enabled: true,
            order: 3
        },
        {
            id: 'window.close',
            contributionId: 'window.close',
            enabled: true,
            order: 4
        }
    ]
};

export const DefaultFootBarConfig: BarConfig = NULLBarConfig;
export const DefaultSideBarConfig: BarConfig = NULLBarConfig;

export const DefaultLayoutConfigs: LayoutConfigs = {
    titlebar: DefaultTitleBarConfig,
    footbar: DefaultFootBarConfig,
    sidebar: DefaultSideBarConfig
};

export const DefaultLayoutSettings: LayoutSettings = {
    titlebar: true,
    header: true,
    footer: true,
    layoutConfigs: DefaultLayoutConfigs
};

export function createTitleBarItem(
    contributionId: TitleBarContributionId,
    order: number,
    options: {
        id?: string;
        enabled?: boolean;
        iconId?: TitleBarIconId;
        titleOverride?: string;
    } = {}
): TitleBarItemConfig {
    return {
        id: options.id ?? contributionId,
        contributionId,
        enabled: options.enabled ?? true,
        order,
        iconId: options.iconId,
        titleOverride: options.titleOverride
    };
}

export function cloneBarConfig(config: BarConfig): BarConfig {
    return {
        left: config.left.map((item) => ({ ...item })),
        center: config.center.map((item) => ({ ...item })),
        right: config.right.map((item) => ({ ...item }))
    };
}

export function normalizeTitleBarConfig(config?: LegacyBarConfig | BarConfig | null): BarConfig {
    const source = config ?? DefaultTitleBarConfig;
    const normalized: BarConfig = { left: [], center: [], right: [] };
    const usedIds = new Set<string>();

    for (const section of BAR_SECTIONS) {
        const items = Array.isArray(source[section]) ? source[section] : [];
        normalized[section] = items
            .map((item, index) => migrateTitleBarItem(item, index, usedIds))
            .filter((item): item is TitleBarItemConfig => Boolean(item))
            .sort((left, right) => left.order - right.order)
            .map((item, index) => ({ ...item, order: index }));
    }

    return normalized;
}

export function migrateTitleBarConfig(config?: LegacyBarConfig | BarConfig | null): BarConfig {
    return normalizeTitleBarConfig(config);
}

export function moveTitleBarItem(
    config: BarConfig,
    from: TitleBarItemMoveTarget,
    to: TitleBarItemMoveTarget
): BarConfig {
    const next = normalizeTitleBarConfig(config);
    const source = [...next[from.section]];
    const [item] = source.splice(from.index, 1);
    if (!item) return next;

    next[from.section] = source;
    const target = from.section === to.section ? source : [...next[to.section]];
    const adjustedIndex =
        from.section === to.section && to.index > from.index ? to.index - 1 : to.index;
    const targetIndex = Math.max(0, Math.min(adjustedIndex, target.length));
    target.splice(targetIndex, 0, item);
    next[to.section] = target;

    return normalizeTitleBarConfig(next);
}

export function setTitleBarItemEnabled(
    config: BarConfig,
    itemId: string,
    enabled: boolean
): BarConfig {
    const next = normalizeTitleBarConfig(config);
    for (const section of BAR_SECTIONS) {
        next[section] = next[section].map((item) =>
            item.id === itemId ? { ...item, enabled } : item
        );
    }

    return next;
}

export function updateTitleBarItem(
    config: BarConfig,
    itemId: string,
    updater: (item: TitleBarItemConfig) => TitleBarItemConfig
): BarConfig {
    const next = normalizeTitleBarConfig(config);
    for (const section of BAR_SECTIONS) {
        next[section] = next[section].map((item) => (item.id === itemId ? updater(item) : item));
    }

    return normalizeTitleBarConfig(next);
}

export function swapTitleBarItemOrder(
    config: BarConfig,
    section: BarSection,
    index: number,
    offset: -1 | 1
): BarConfig {
    const next = normalizeTitleBarConfig(config);
    const items = [...next[section]];
    const targetIndex = index + offset;
    if (index < 0 || index >= items.length || targetIndex < 0 || targetIndex >= items.length) {
        return next;
    }

    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    next[section] = items.map((item, order) => ({ ...item, order }));

    return normalizeTitleBarConfig(next);
}

export function moveTitleBarItemByDirection(
    config: BarConfig,
    section: BarSection,
    index: number,
    direction: -1 | 1
): BarConfig {
    const next = normalizeTitleBarConfig(config);
    const sectionIndex = BAR_SECTIONS.indexOf(section);
    const items = [...next[section]];
    const targetIndex = index + direction;

    if (targetIndex >= 0 && targetIndex < items.length) {
        return swapTitleBarItemOrder(next, section, index, direction);
    }

    const nextSection = BAR_SECTIONS[sectionIndex + direction];
    if (!nextSection) return next;

    const [item] = items.splice(index, 1);
    if (!item) return next;

    const targetItems = [...next[nextSection]];
    const insertIndex = direction < 0 ? targetItems.length : 0;
    targetItems.splice(insertIndex, 0, item);

    next[section] = items.map((item, order) => ({ ...item, order }));
    next[nextSection] = targetItems.map((item, order) => ({ ...item, order }));

    return normalizeTitleBarConfig(next);
}

export function toggleTitleBarItem(config: BarConfig, itemId: string): BarConfig {
    const next = normalizeTitleBarConfig(config);
    for (const section of BAR_SECTIONS) {
        next[section] = next[section].map((item) =>
            item.id === itemId ? { ...item, enabled: !item.enabled } : item
        );
    }

    return next;
}

export function removeTitleBarItem(config: BarConfig, itemId: string): BarConfig {
    const next = normalizeTitleBarConfig(config);
    for (const section of BAR_SECTIONS) {
        next[section] = next[section].filter((item) => item.id !== itemId);
    }

    return normalizeTitleBarConfig(next);
}

export function completeTitleBarConfig(
    config: LegacyBarConfig | BarConfig | undefined | null,
    contributions: TitleBarContributionLayoutDescriptor[]
): BarConfig {
    const next = normalizeTitleBarConfig(config);
    const existingContributionIds = new Set(
        BAR_SECTIONS.flatMap((section) => next[section].map((item) => item.contributionId))
    );

    for (const contribution of contributions) {
        if (existingContributionIds.has(contribution.id)) continue;

        const section = getDefaultTitleBarSection(contribution);
        next[section] = [
            ...next[section],
            createTitleBarItem(contribution.id, next[section].length, {
                id: createUniqueTitleBarItemId(contribution.id, next),
                enabled: false
            })
        ];
        existingContributionIds.add(contribution.id);
    }

    return normalizeTitleBarConfig(next);
}

export function addTitleBarItem(
    config: BarConfig,
    section: BarSection,
    contributionId: TitleBarContributionId,
    options: { iconId?: TitleBarIconId; titleOverride?: string } = {}
): BarConfig {
    const next = normalizeTitleBarConfig(config);
    next[section] = [
        ...next[section],
        createTitleBarItem(contributionId, next[section].length, {
            id: createUniqueTitleBarItemId(contributionId, next),
            iconId: options.iconId,
            titleOverride: options.titleOverride
        })
    ];

    return normalizeTitleBarConfig(next);
}

function getDefaultTitleBarSection(contribution: TitleBarContributionLayoutDescriptor): BarSection {
    if (contribution.defaultSection) return contribution.defaultSection;

    for (const section of BAR_SECTIONS) {
        if (
            DefaultTitleBarConfig[section].some((item) => item.contributionId === contribution.id)
        ) {
            return section;
        }
    }

    if (contribution.id === 'app.icon' || contribution.id === 'app.title') return 'center';
    if (contribution.id === 'window.dragRegion') return 'center';
    if (contribution.category === 'window' || contribution.category === 'theme') return 'right';

    return 'left';
}

function migrateTitleBarItem(
    item: LegacyButtonConfig | TitleBarItemConfig | undefined,
    index: number,
    usedIds: Set<string>
): TitleBarItemConfig | null {
    if (!item) return null;
    const legacyType = 'type' in item ? item.type : undefined;
    const contributionId =
        item.contributionId ??
        (legacyType ? legacyButtonTypeToContributionId[legacyType] : undefined) ??
        item.id;

    if (!contributionId) return null;

    const legacyName = 'name' in item ? item.name : undefined;
    const baseId = item.id ?? legacyName ?? contributionId;
    const id = makeUniqueId(baseId, usedIds);

    return {
        id,
        contributionId,
        enabled: item.enabled ?? true,
        order: typeof item.order === 'number' ? item.order : index,
        iconId: item.iconId,
        titleOverride: item.titleOverride
    };
}

function createUniqueTitleBarItemId(contributionId: string, config: BarConfig): string {
    const usedIds = new Set(
        BAR_SECTIONS.flatMap((section) => config[section].map((item) => item.id))
    );
    return makeUniqueId(contributionId, usedIds);
}

function makeUniqueId(baseId: string, usedIds: Set<string>): string {
    let id = baseId;
    let index = 2;
    while (usedIds.has(id)) {
        id = `${baseId}-${index}`;
        index += 1;
    }
    usedIds.add(id);
    return id;
}
