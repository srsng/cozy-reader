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
import type {
    SettingGroup,
    SettingKey,
    SettingPropertySchema,
    SettingViewModel,
    SettingsSnapshot,
    SettingsTab
} from './types';
import {
    createSettingOptions,
    createSettingViewModel,
    inferPresentation,
    isConditionMet
} from './types';

function enumValuesFromRecord(record: Record<string, string>) {
    return Object.keys(record);
}

function enumLabelsFromRecord(record: Record<string, string>) {
    return Object.values(record);
}

export const settingsGroups: SettingGroup[] = [
    // TODO: hidden settings for tmp
    // {
    //     id: 'base.language',
    //     tab: 'base',
    //     label: '语言设置',
    //     description: '选择应用程序的显示语言',
    //     order: 10
    // },
    {
        id: 'base.interface',
        tab: 'base',
        label: '界面设置',
        description: '控制应用程序界面的显示选项',
        order: 20
    },
    // TODO: hidden settings for tmp
    // {
    //     id: 'base.layout',
    //     tab: 'base',
    //     label: '窗口布局',
    //     description: '控制应用窗口的布局区域显示',
    //     order: 30
    // },
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
    }
    // TODO: hidden settings for tmp
    // {
    //     id: 'reader.font',
    //     tab: 'reader',
    //     label: '字体设置',
    //     description: '配置阅读器的字体相关选项',
    //     order: 10
    // },
    // {
    //     id: 'reader.layout',
    //     tab: 'reader',
    //     label: '布局设置',
    //     description: '配置阅读器的布局选项',
    //     order: 20
    // }
];

export const settingsConfiguration: readonly SettingPropertySchema[] = [
    {
        key: 'base.langCode',
        category: 'base',
        group: 'base.language',
        title: '语言',
        description: '选择应用程序的显示语言',
        type: 'string',
        default: DefaultBaseSettings.langCode,
        enum: enumValuesFromRecord(langCode2Name),
        enumItemLabels: enumLabelsFromRecord(langCode2Name),
        order: 10,
        tags: ['language', 'locale', 'base'],
        keywords: ['显示语言', '简体中文', 'English'],
        ui: { presentation: 'select' }
    },
    {
        key: 'base.uiOpacity',
        category: 'base',
        group: 'base.interface',
        title: 'UI不透明度',
        description: '调整整体界面不透明度',
        type: 'number',
        default: DefaultBaseSettings.uiOpacity,
        minimum: 0.1,
        maximum: 1,
        multipleOf: 0.01,
        order: 20,
        tags: ['appearance', 'opacity', 'base'],
        keywords: ['透明度', '界面透明度'],
        ui: { presentation: 'slider', format: 'ratio-percentage' }
    },
    {
        key: 'base.bodyTransparent',
        category: 'base',
        group: 'base.interface',
        title: '窗口背景层不透明度',
        description: '调整窗口背景层不透明度: 0~100%（1为完全不透明，0为完全透明）',
        type: 'number',
        default: DefaultBaseSettings.bodyTransparent,
        minimum: 0,
        maximum: 1,
        multipleOf: 0.02,
        order: 30,
        tags: ['appearance', 'opacity', 'window'],
        keywords: ['背景透明度', '窗口透明度', 'body transparent'],
        ui: { presentation: 'slider', format: 'ratio-percentage' }
    },
    {
        key: 'base.layoutControlsOutline',
        category: 'base',
        group: 'base.interface',
        title: '标题栏等布局控件外框线',
        description: '如果启用了窗口背景层不透明度，关闭该项可以提升沉浸感',
        type: 'boolean',
        default: DefaultBaseSettings.layoutControlsOutline,
        order: 40,
        tags: ['appearance', 'layout', 'base'],
        keywords: ['外框', '边框', 'outline'],
        ui: { presentation: 'switch' }
    },
    {
        key: 'base.zoom',
        category: 'base',
        group: 'base.interface',
        title: '缩放比例',
        description: '应用程序的整体缩放比例',
        type: 'number',
        default: DefaultBaseSettings.zoom,
        order: 50,
        tags: ['zoom', 'base'],
        keywords: ['放大', '缩小', '比例', '缩放'],
        ui: { presentation: 'custom', component: 'zoom' }
    },
    {
        key: 'base.alwaysOnTop',
        category: 'base',
        group: 'base.interface',
        title: '始终置顶',
        description: '让窗口始终保持在最前面',
        type: 'boolean',
        default: DefaultBaseSettings.alwaysOnTop,
        order: 60,
        tags: ['window', 'base'],
        keywords: ['置顶', 'always on top'],
        ui: { presentation: 'switch' }
    },
    {
        key: 'layout.titlebar',
        category: 'base',
        group: 'base.layout',
        title: '标题栏',
        description: '显示应用程序标题栏',
        type: 'boolean',
        default: DefaultLayoutSettings.titlebar,
        order: 70,
        tags: ['layout', 'window'],
        keywords: ['titlebar', '标题'],
        ui: { presentation: 'switch' }
    },
    {
        key: 'layout.header',
        category: 'base',
        group: 'base.layout',
        title: '页眉',
        description: '显示页面顶部导航栏',
        type: 'boolean',
        default: DefaultLayoutSettings.header,
        order: 80,
        tags: ['layout', 'navigation'],
        keywords: ['header', '顶部导航'],
        ui: { presentation: 'switch' }
    },
    {
        key: 'layout.footer',
        category: 'base',
        group: 'base.layout',
        title: '页脚',
        description: '显示页面底部信息栏',
        type: 'boolean',
        default: DefaultLayoutSettings.footer,
        order: 90,
        tags: ['layout', 'navigation'],
        keywords: ['footer', '底部信息'],
        ui: { presentation: 'switch' }
    },
    {
        key: 'theme.mode',
        category: 'theme',
        group: 'theme.mode',
        title: '主题模式',
        description: '选择应用程序的主题模式',
        type: 'string',
        default: 'system',
        enum: enumValuesFromRecord(AppThemeMode2Str),
        enumItemLabels: enumLabelsFromRecord(AppThemeMode2Str),
        order: 100,
        tags: ['theme', 'appearance'],
        keywords: ['浅色', '深色', '跟随系统', 'light', 'dark', 'system'],
        ui: { presentation: 'button-group' }
    },
    {
        key: 'theme.type',
        category: 'theme',
        group: 'theme.type',
        title: '主题类型',
        description: '选择主题的配色方案',
        type: 'string',
        default: 'standard',
        enum: enumValuesFromRecord(AppThemeType2Str),
        enumItemLabels: enumLabelsFromRecord(AppThemeType2Str),
        order: 110,
        tags: ['theme', 'appearance'],
        keywords: ['标准', '四色', '友谊是魔法'],
        ui: { presentation: 'button-group' }
    },
    {
        key: 'theme.data.standard.name',
        category: 'theme',
        group: 'theme.config',
        title: '主题色',
        description: '选择标准主题的主题色',
        type: 'string',
        default: DefaultThemeData.standard.name,
        enum: ALL_Std_TD_NAMES,
        enumItemLabels: ALL_Std_TD_NAMES,
        order: 120,
        tags: ['theme', 'color'],
        keywords: ['标准', '主题色', '颜色'],
        when: {
            expression: 'config.theme.type == "standard"',
            disabledReason: '仅在标准主题下可用'
        },
        ui: { presentation: 'button-group' }
    },
    {
        key: 'theme.data.four_colors.hue',
        category: 'theme',
        group: 'theme.config',
        title: '色相值',
        description: '1~360°，每一个色相都是一个不同的主题',
        type: 'number',
        default: DefaultThemeData.four_colors.hue,
        minimum: 1,
        maximum: 360,
        multipleOf: 1,
        order: 130,
        tags: ['theme', 'color', 'hue'],
        keywords: ['色相', '四色', 'hue'],
        when: {
            expression: 'config.theme.type == "four_colors"',
            disabledReason: '仅在四色主题下可用'
        },
        ui: { presentation: 'slider', format: 'number', inlineInput: true }
    },
    {
        key: 'theme.data.pony.name',
        category: 'theme',
        group: 'theme.config',
        title: '小马主题',
        description: '选择友谊是魔法主题角色',
        type: 'string',
        default: DefaultThemeData.pony.name,
        enum: ALL_Pony_NAMES,
        enumItemLabels: ALL_Pony_NAMES,
        order: 140,
        tags: ['theme', 'pony'],
        keywords: ['小马', '友谊是魔法', '角色', 'pony'],
        when: {
            expression: 'config.theme.type == "pony"',
            disabledReason: '仅在友谊是魔法主题下可用'
        },
        ui: { presentation: 'button-group' }
    },
    {
        key: 'theme.effects',
        category: 'theme',
        group: 'theme.effects',
        title: '窗口效果',
        description: '设置窗口背景层效果，需要开启窗口背景层不透明度才有效果',
        type: 'string',
        default: 'none',
        enum: ['none', 'mica', 'acrylic', 'blur'],
        enumItemLabels: ['无', '云母', '亚克力', '模糊'],
        order: 150,
        tags: ['theme', 'window', 'effects'],
        keywords: ['窗口效果', '背景效果', 'mica', 'acrylic', 'blur'],
        ui: { presentation: 'custom', component: 'themeEffects' }
    }
    // TODO: hidden settings for tmp
    // {
    //     key: 'reader.fontFamily',
    //     category: 'reader',
    //     group: 'reader.font',
    //     title: '字体族',
    //     description: '设置阅读器使用的字体',
    //     type: 'string',
    //     default: DefaultReaderSettings.fontFamily,
    //     order: 160,
    //     tags: ['reader', 'font'],
    //     keywords: ['字体', 'font family'],
    //     ui: {
    //         presentation: 'custom',
    //         component: 'fontFamily',
    //         placeholder: "请输入字体名称，如：'Microsoft YaHei', sans-serif"
    //     }
    // },
    // {
    //     key: 'reader.fontSize',
    //     category: 'reader',
    //     group: 'reader.font',
    //     title: '字体大小',
    //     description: '调整文字大小',
    //     type: 'number',
    //     default: DefaultReaderSettings.fontSize,
    //     minimum: 12,
    //     maximum: 48,
    //     multipleOf: 1,
    //     order: 170,
    //     tags: ['reader', 'font'],
    //     keywords: ['字号', '文字大小', 'font size'],
    //     ui: { presentation: 'slider', format: 'px' }
    // },
    // {
    //     key: 'reader.lineHeight',
    //     category: 'reader',
    //     group: 'reader.font',
    //     title: '行高',
    //     description: '调整行间距',
    //     type: 'number',
    //     default: DefaultReaderSettings.lineHeight,
    //     minimum: 120,
    //     maximum: 300,
    //     multipleOf: 10,
    //     order: 180,
    //     tags: ['reader', 'font'],
    //     keywords: ['行间距', 'line height'],
    //     ui: { presentation: 'slider', format: 'percentage' }
    // },
    // {
    //     key: 'reader.viewerWidth',
    //     category: 'reader',
    //     group: 'reader.layout',
    //     title: '阅读器宽度',
    //     description: '调整阅读区域宽度',
    //     type: 'number',
    //     default: DefaultReaderSettings.viewerWidth,
    //     minimum: 30,
    //     maximum: 90,
    //     multipleOf: 5,
    //     order: 190,
    //     tags: ['reader', 'layout'],
    //     keywords: ['阅读区域', '宽度', 'viewer width'],
    //     ui: { presentation: 'slider', format: 'percentage' }
    // },
    // {
    //     key: 'reader.firstLineIndent',
    //     category: 'reader',
    //     group: 'reader.layout',
    //     title: '首行缩进',
    //     description: '段落首行自动缩进',
    //     type: 'boolean',
    //     default: DefaultReaderSettings.firstLineIndent,
    //     order: 200,
    //     tags: ['reader', 'layout', 'typography'],
    //     keywords: ['段落缩进', 'indent'],
    //     ui: { presentation: 'switch' }
    // },
    // {
    //     key: 'reader.zoomLongPic',
    //     category: 'reader',
    //     group: 'reader.layout',
    //     title: '长图缩放',
    //     description: '自动缩放长图片以适应阅读高度',
    //     type: 'boolean',
    //     default: DefaultReaderSettings.zoomLongPic,
    //     order: 210,
    //     tags: ['reader', 'image'],
    //     keywords: ['长图', '图片缩放', 'image'],
    //     ui: { presentation: 'switch' }
    // },
    // {
    //     key: 'reader.scrollBarVisable',
    //     category: 'reader',
    //     group: 'reader.layout',
    //     title: '滚动条可见',
    //     description: '显示滚动条',
    //     type: 'boolean',
    //     default: DefaultReaderSettings.scrollBarVisable,
    //     order: 220,
    //     tags: ['reader', 'layout'],
    //     keywords: ['滚动条', 'scrollbar'],
    //     ui: { presentation: 'switch' }
    // }
];

function createDefaultSettingViewModel(schema: SettingPropertySchema): SettingViewModel {
    return {
        key: schema.key,
        id: schema.key,
        tab: schema.category,
        group: schema.group,
        label: schema.title,
        description: schema.description,
        type: inferPresentation(schema),
        value: schema.default,
        defaultValue: schema.default,
        options: createSettingOptions(schema),
        min: schema.minimum,
        max: schema.maximum,
        step: schema.multipleOf,
        format: schema.ui?.format,
        placeholder: schema.ui?.placeholder,
        inputType: schema.ui?.inputType,
        component: schema.ui?.component,
        inlineInput: schema.ui?.inlineInput,
        condition: schema.when,
        disabled: false,
        order: schema.order,
        schema
    };
}

const defaultSettingViewModels = settingsConfiguration.map(createDefaultSettingViewModel);

export function getSettingsSchemaByKey(key: SettingKey): SettingPropertySchema | undefined {
    return settingsConfiguration.find((schema) => schema.key === key);
}

export function getEntriesByTab(
    tab: SettingsTab,
    settingsSnapshot?: SettingsSnapshot,
    options: { includeConditionallyHidden?: boolean } = {}
): SettingViewModel[] {
    return settingsConfiguration
        .filter((schema) => schema.category === tab)
        .filter((schema) => {
            if (options.includeConditionallyHidden || !settingsSnapshot) return true;
            return isConditionMet(schema, settingsSnapshot);
        })
        .map((schema) => {
            if (!settingsSnapshot) {
                return defaultSettingViewModels.find((entry) => entry.key === schema.key);
            }
            return createSettingViewModel(schema, settingsSnapshot, options);
        })
        .filter((entry): entry is SettingViewModel => Boolean(entry))
        .sort((a, b) => a.order - b.order);
}

export function getGroupsByTab(tab: SettingsTab): SettingGroup[] {
    return settingsGroups.filter((group) => group.tab === tab).sort((a, b) => a.order - b.order);
}

export function getSettingViewModelByKey(
    key: SettingKey,
    settingsSnapshot?: SettingsSnapshot
): SettingViewModel | undefined {
    const schema = getSettingsSchemaByKey(key);
    if (!schema) return undefined;
    if (!settingsSnapshot) return defaultSettingViewModels.find((entry) => entry.key === key);
    return createSettingViewModel(schema, settingsSnapshot, { includeConditionallyHidden: true });
}

export type SettingSearchToken =
    | { kind: 'text'; value: string }
    | { kind: 'id'; value: string }
    | { kind: 'tag'; value: string }
    | { kind: 'feature'; value: string }
    | { kind: 'modified' };

function parseSearchTokens(query: string): SettingSearchToken[] {
    return query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((token) => {
            if (token === '@modified') return { kind: 'modified' };
            if (token.startsWith('@id:')) return { kind: 'id', value: token.slice(4) };
            if (token.startsWith('@tag:')) return { kind: 'tag', value: token.slice(5) };
            if (token.startsWith('@feature:')) return { kind: 'feature', value: token.slice(9) };
            return { kind: 'text', value: token };
        });
}

function groupSearchText(groupId: string): string {
    const group = settingsGroups.find((item) => item.id === groupId);
    return `${group?.label ?? ''} ${group?.description ?? ''}`.toLowerCase();
}

function isModified(schema: SettingPropertySchema, settingsSnapshot?: SettingsSnapshot): boolean {
    if (!settingsSnapshot) return false;
    const entry = createSettingViewModel(schema, settingsSnapshot, {
        includeConditionallyHidden: true
    });
    return JSON.stringify(entry?.value) !== JSON.stringify(schema.default);
}

function scoreTextMatch(schema: SettingPropertySchema, token: string): number {
    const key = schema.key.toLowerCase();
    const title = schema.title.toLowerCase();
    const description = (schema.description ?? '').toLowerCase();
    const markdownDescription = (schema.markdownDescription ?? '').toLowerCase();
    const tags = (schema.tags ?? []).join(' ').toLowerCase();
    const keywords = (schema.keywords ?? []).join(' ').toLowerCase();
    const enumText = [...(schema.enum ?? []), ...(schema.enumItemLabels ?? [])]
        .join(' ')
        .toLowerCase();
    const featureText =
        `${schema.category} ${schema.group} ${groupSearchText(schema.group)}`.toLowerCase();

    if (key === token) return 1000;
    if (key.includes(token)) return 800;
    if (title.includes(token)) return 700;
    if (keywords.includes(token)) return 600;
    if (tags.includes(token)) return 500;
    if (enumText.includes(token)) return 400;
    if (featureText.includes(token)) return 300;
    if (`${description} ${markdownDescription}`.includes(token)) return 200;
    return 0;
}

function matchSearchToken(
    schema: SettingPropertySchema,
    token: SettingSearchToken,
    settingsSnapshot?: SettingsSnapshot
): number {
    if (token.kind === 'modified') return isModified(schema, settingsSnapshot) ? 100 : 0;
    if (token.kind === 'id') return schema.key.toLowerCase().includes(token.value) ? 1000 : 0;
    if (token.kind === 'tag')
        return (schema.tags ?? []).some((tag) => tag.toLowerCase().includes(token.value)) ? 500 : 0;
    if (token.kind === 'feature') {
        const featureText =
            `${schema.category} ${schema.group} ${groupSearchText(schema.group)}`.toLowerCase();
        return featureText.includes(token.value) ? 300 : 0;
    }
    return scoreTextMatch(schema, token.value);
}

export function searchEntries(
    query: string,
    settingsSnapshot?: SettingsSnapshot
): Map<SettingsTab, SettingViewModel[]> {
    const tokens = parseSearchTokens(query);
    const results = new Map<SettingsTab, SettingViewModel[]>();

    if (tokens.length === 0) return results;

    const matches = settingsConfiguration
        .map((schema) => {
            const score = tokens.reduce((total, token) => {
                const tokenScore = matchSearchToken(schema, token, settingsSnapshot);
                if (tokenScore === 0) return Number.NEGATIVE_INFINITY;
                return total + tokenScore;
            }, 0);
            return { schema, score };
        })
        .filter((match) => Number.isFinite(match.score))
        .sort((a, b) => b.score - a.score || a.schema.order - b.schema.order);

    for (const match of matches) {
        const entry = settingsSnapshot
            ? createSettingViewModel(match.schema, settingsSnapshot, {
                  includeConditionallyHidden: true
              })
            : defaultSettingViewModels.find((item) => item.key === match.schema.key);
        if (!entry) continue;

        const tabResults = results.get(entry.tab) ?? [];
        tabResults.push(entry);
        results.set(entry.tab, tabResults);
    }

    return results;
}

export function getSearchResultCount(results: Map<SettingsTab, SettingViewModel[]>): number {
    return Array.from(results.values()).reduce((count, entries) => count + entries.length, 0);
}
