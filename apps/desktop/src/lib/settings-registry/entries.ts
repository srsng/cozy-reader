import {
    ALL_Pony_NAMES,
    ALL_Std_TD_NAMES,
    AppThemeMode2Str,
    AppThemeType2Str,
    DefaultThemeData
} from '$lib/settings/Theme';
import { DefaultBaseSettings, langCode2Name } from '$lib/settings/Base';
import { DefaultLayoutSettings } from '$lib/settings/Layout';
import { DefaultReaderSettings } from '$lib/settings/Reader';
import type { SettingEntry, SettingGroup, SettingsTab, SettingsSnapshot } from './types';
import { isConditionMet } from './types';

function optionsFromRecord(record: Record<string, string>) {
    return Object.entries(record).map(([value, label]) => ({ value, label }));
}

function optionsFromValues(values: string[]) {
    return values.map((value) => ({ value, label: value }));
}

export const settingsGroups: SettingGroup[] = [
    {
        id: 'base.language',
        tab: 'base',
        label: '语言设置',
        description: '选择应用程序的显示语言',
        order: 10
    },
    {
        id: 'base.interface',
        tab: 'base',
        label: '界面设置',
        description: '控制应用程序界面的显示选项',
        order: 20
    },
    {
        id: 'base.layout',
        tab: 'base',
        label: '窗口布局',
        description: '控制应用窗口的布局区域显示',
        order: 30
    },
    {
        id: 'theme.mode',
        tab: 'theme',
        label: '主题模式',
        description: '选择应用程序的主题模式',
        order: 10
    },
    {
        id: 'theme.type',
        tab: 'theme',
        label: '主题类型',
        description: '选择主题的配色方案',
        order: 20
    },
    {
        id: 'theme.config',
        tab: 'theme',
        label: '主题配置',
        description: '配置当前主题类型的专属选项',
        order: 30
    },
    {
        id: 'theme.effects',
        tab: 'theme',
        label: '窗口效果',
        description: '设置窗口背景层效果',
        order: 40
    },
    {
        id: 'reader.font',
        tab: 'reader',
        label: '字体设置',
        description: '配置阅读器的字体相关选项',
        order: 10
    },
    {
        id: 'reader.layout',
        tab: 'reader',
        label: '布局设置',
        description: '配置阅读器的布局选项',
        order: 20
    }
];

export const settingsEntries: SettingEntry[] = [
    {
        id: 'base.langCode',
        tab: 'base',
        group: 'base.language',
        label: '语言',
        description: '选择应用程序的显示语言',
        store: 'userSettings',
        path: 'base.langCode',
        type: 'select',
        defaultValue: DefaultBaseSettings.langCode,
        props: { options: optionsFromRecord(langCode2Name) },
        onChangeAction: { kind: 'handler', name: 'base.langCode' },
        order: 10
    },
    {
        id: 'base.uiOpacity',
        tab: 'base',
        group: 'base.interface',
        label: 'UI不透明度',
        description: '调整整体界面不透明度',
        store: 'userSettings',
        path: 'base.uiOpacity',
        type: 'slider',
        defaultValue: DefaultBaseSettings.uiOpacity,
        props: { min: 0.1, max: 1, step: 0.01, format: 'ratio-percentage' },
        order: 20
    },
    {
        id: 'base.bodyTransparent',
        tab: 'base',
        group: 'base.interface',
        label: '窗口背景层不透明度',
        description: '调整窗口背景层不透明度: 0~100%（1为完全不透明，0为完全透明）',
        store: 'userSettings',
        path: 'base.bodyTransparent',
        type: 'slider',
        defaultValue: DefaultBaseSettings.bodyTransparent,
        props: { min: 0, max: 1, step: 0.02, format: 'ratio-percentage' },
        order: 30
    },
    {
        id: 'base.layoutControlsOutline',
        tab: 'base',
        group: 'base.interface',
        label: '标题栏等布局控件外框线',
        description: '如果启用了窗口背景层不透明度，关闭该项可以提升沉浸感',
        store: 'userSettings',
        path: 'base.layoutControlsOutline',
        type: 'switch',
        defaultValue: DefaultBaseSettings.layoutControlsOutline,
        order: 40
    },
    {
        id: 'base.zoom',
        tab: 'base',
        group: 'base.interface',
        label: '缩放比例',
        description: '应用程序的整体缩放比例',
        store: 'userSettings',
        path: 'base.zoom',
        type: 'custom',
        defaultValue: DefaultBaseSettings.zoom,
        props: { component: 'zoom' },
        order: 50
    },
    {
        id: 'base.alwaysOnTop',
        tab: 'base',
        group: 'base.interface',
        label: '始终置顶',
        description: '让窗口始终保持在最前面',
        store: 'userSettings',
        path: 'base.alwaysOnTop',
        type: 'switch',
        defaultValue: DefaultBaseSettings.alwaysOnTop,
        onChangeAction: { kind: 'handler', name: 'base.alwaysOnTop' },
        order: 60
    },
    {
        id: 'layout.titlebar',
        tab: 'base',
        group: 'base.layout',
        label: '标题栏',
        description: '显示应用程序标题栏',
        store: 'userSettings',
        path: 'layout.titlebar',
        type: 'switch',
        defaultValue: DefaultLayoutSettings.titlebar,
        order: 70
    },
    {
        id: 'layout.header',
        tab: 'base',
        group: 'base.layout',
        label: '页眉',
        description: '显示页面顶部导航栏',
        store: 'userSettings',
        path: 'layout.header',
        type: 'switch',
        defaultValue: DefaultLayoutSettings.header,
        order: 80
    },
    {
        id: 'layout.footer',
        tab: 'base',
        group: 'base.layout',
        label: '页脚',
        description: '显示页面底部信息栏',
        store: 'userSettings',
        path: 'layout.footer',
        type: 'switch',
        defaultValue: DefaultLayoutSettings.footer,
        order: 90
    },
    {
        id: 'theme.mode',
        tab: 'theme',
        group: 'theme.mode',
        label: '主题模式',
        description: '选择应用程序的主题模式',
        store: 'userSettings',
        path: 'theme.mode',
        type: 'button-list',
        props: { options: optionsFromRecord(AppThemeMode2Str) },
        onChangeAction: { kind: 'handler', name: 'theme.mode' },
        order: 100
    },
    {
        id: 'theme.type',
        tab: 'theme',
        group: 'theme.type',
        label: '主题类型',
        description: '选择主题的配色方案',
        store: 'userSettings',
        path: 'theme.type',
        type: 'button-list',
        props: { options: optionsFromRecord(AppThemeType2Str) },
        onChangeAction: { kind: 'handler', name: 'theme.type' },
        order: 110
    },
    {
        id: 'theme.data.standard.name',
        tab: 'theme',
        group: 'theme.config',
        label: '标准主题色',
        description: '选择标准主题的颜色',
        store: 'userSettings',
        path: 'theme.data.standard.name',
        type: 'button-list',
        defaultValue: DefaultThemeData.standard.name,
        props: { options: optionsFromValues(ALL_Std_TD_NAMES) },
        condition: {
            field: 'theme.type',
            equals: 'standard',
            disabledReason: '仅在标准主题下可用'
        },
        onChangeAction: { kind: 'handler', name: 'theme.data.standard.name' },
        order: 120
    },
    {
        id: 'theme.data.four_colors.hue',
        tab: 'theme',
        group: 'theme.config',
        label: '色相值',
        description: '1~360°，每一个色相都是一个不同的主题',
        store: 'userSettings',
        path: 'theme.data.four_colors.hue',
        type: 'slider',
        defaultValue: DefaultThemeData.four_colors.hue,
        props: { min: 1, max: 360, step: 1, format: 'number', inlineInput: true },
        condition: {
            field: 'theme.type',
            equals: 'four_colors',
            disabledReason: '仅在四色主题下可用'
        },
        onChangeAction: { kind: 'handler', name: 'theme.data.four_colors.hue' },
        order: 130
    },
    {
        id: 'theme.data.pony.name',
        tab: 'theme',
        group: 'theme.config',
        label: '小马主题',
        description: '选择友谊是魔法主题角色',
        store: 'userSettings',
        path: 'theme.data.pony.name',
        type: 'button-list',
        defaultValue: DefaultThemeData.pony.name,
        props: { options: optionsFromValues(ALL_Pony_NAMES) },
        condition: {
            field: 'theme.type',
            equals: 'pony',
            disabledReason: '仅在友谊是魔法主题下可用'
        },
        order: 140
    },
    {
        id: 'theme.effects',
        tab: 'theme',
        group: 'theme.effects',
        label: '窗口效果',
        description: '设置窗口背景层效果，需要开启窗口背景层不透明度才有效果',
        store: 'userSettings',
        path: 'theme.effects',
        type: 'custom',
        defaultValue: 'none',
        props: { component: 'themeEffects' },
        order: 150
    },
    {
        id: 'reader.fontFamily',
        tab: 'reader',
        group: 'reader.font',
        label: '字体族',
        description: '设置阅读器使用的字体',
        store: 'userSettings',
        path: 'reader.fontFamily',
        type: 'custom',
        defaultValue: DefaultReaderSettings.fontFamily,
        props: {
            component: 'fontFamily',
            placeholder: "请输入字体名称，如：'Microsoft YaHei', sans-serif"
        },
        order: 160
    },
    {
        id: 'reader.fontSize',
        tab: 'reader',
        group: 'reader.font',
        label: '字体大小',
        description: '调整文字大小',
        store: 'userSettings',
        path: 'reader.fontSize',
        type: 'slider',
        defaultValue: DefaultReaderSettings.fontSize,
        props: { min: 12, max: 48, step: 1, format: 'px' },
        order: 170
    },
    {
        id: 'reader.lineHeight',
        tab: 'reader',
        group: 'reader.font',
        label: '行高',
        description: '调整行间距',
        store: 'userSettings',
        path: 'reader.lineHeight',
        type: 'slider',
        defaultValue: DefaultReaderSettings.lineHeight,
        props: { min: 120, max: 300, step: 10, format: 'percentage' },
        order: 180
    },
    {
        id: 'reader.viewerWidth',
        tab: 'reader',
        group: 'reader.layout',
        label: '阅读器宽度',
        description: '调整阅读区域宽度',
        store: 'userSettings',
        path: 'reader.viewerWidth',
        type: 'slider',
        defaultValue: DefaultReaderSettings.viewerWidth,
        props: { min: 30, max: 90, step: 5, format: 'percentage' },
        order: 190
    },
    {
        id: 'reader.firstLineIndent',
        tab: 'reader',
        group: 'reader.layout',
        label: '首行缩进',
        description: '段落首行自动缩进',
        store: 'userSettings',
        path: 'reader.firstLineIndent',
        type: 'switch',
        defaultValue: DefaultReaderSettings.firstLineIndent,
        order: 200
    },
    {
        id: 'reader.zoomLongPic',
        tab: 'reader',
        group: 'reader.layout',
        label: '长图缩放',
        description: '自动缩放长图片以适应阅读高度',
        store: 'userSettings',
        path: 'reader.zoomLongPic',
        type: 'switch',
        defaultValue: DefaultReaderSettings.zoomLongPic,
        order: 210
    },
    {
        id: 'reader.scrollBarVisable',
        tab: 'reader',
        group: 'reader.layout',
        label: '滚动条可见',
        description: '显示滚动条',
        store: 'userSettings',
        path: 'reader.scrollBarVisable',
        type: 'switch',
        defaultValue: DefaultReaderSettings.scrollBarVisable,
        order: 220
    }
];

export function getEntriesByTab(
    tab: SettingsTab,
    settingsSnapshot?: SettingsSnapshot,
    options: { includeConditionallyHidden?: boolean } = {}
): SettingEntry[] {
    return settingsEntries
        .filter((entry) => entry.tab === tab)
        .filter((entry) => {
            if (options.includeConditionallyHidden || !settingsSnapshot) return true;
            return isConditionMet(entry, settingsSnapshot);
        })
        .sort((a, b) => a.order - b.order);
}

export function getGroupsByTab(tab: SettingsTab): SettingGroup[] {
    return settingsGroups.filter((group) => group.tab === tab).sort((a, b) => a.order - b.order);
}

export function getEntryById(id: string): SettingEntry | undefined {
    return settingsEntries.find((entry) => entry.id === id);
}

export function searchEntries(query: string): Map<SettingsTab, SettingEntry[]> {
    const normalized = query.trim().toLowerCase();
    const results = new Map<SettingsTab, SettingEntry[]>();

    if (!normalized) return results;

    for (const entry of settingsEntries) {
        const haystack = `${entry.label} ${entry.description ?? ''}`.toLowerCase();
        if (!haystack.includes(normalized)) continue;

        const tabResults = results.get(entry.tab) ?? [];
        tabResults.push(entry);
        results.set(entry.tab, tabResults);
    }

    return results;
}

export function getSearchResultCount(results: Map<SettingsTab, SettingEntry[]>): number {
    return Array.from(results.values()).reduce((count, entries) => count + entries.length, 0);
}
