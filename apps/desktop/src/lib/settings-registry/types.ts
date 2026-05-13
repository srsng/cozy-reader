import type { UserSettings } from '$lib/settings';

export type SettingsTab = 'base' | 'theme' | 'reader';
export type SettingPrimitiveType = 'boolean' | 'number' | 'string';
export type SettingPresentation = 'switch' | 'slider' | 'input' | 'select' | 'button-list' | 'custom';
export type SettingFormat = 'ratio-percentage' | 'percentage' | 'px' | 'number';
export type SettingCustomComponent = 'zoom' | 'fontFamily' | 'themeEffects';

export type SettingKey =
    | 'base.langCode'
    | 'base.uiOpacity'
    | 'base.bodyTransparent'
    | 'base.layoutControlsOutline'
    | 'base.zoom'
    | 'base.alwaysOnTop'
    | 'layout.titlebar'
    | 'layout.header'
    | 'layout.footer'
    | 'theme.mode'
    | 'theme.type'
    | 'theme.data.standard.name'
    | 'theme.data.four_colors.hue'
    | 'theme.data.pony.name'
    | 'theme.effects'
    | 'reader.fontFamily'
    | 'reader.fontSize'
    | 'reader.lineHeight'
    | 'reader.viewerWidth'
    | 'reader.firstLineIndent'
    | 'reader.zoomLongPic'
    | 'reader.scrollBarVisable';

export type SettingOption<Value extends string = string> = {
    value: Value;
    label: string;
};

export type SettingUISchema = {
    presentation?: SettingPresentation;
    component?: SettingCustomComponent;
    format?: SettingFormat;
    inlineInput?: boolean;
    placeholder?: string;
    inputType?: 'text' | 'number';
};

export type SettingWhen = {
    key: SettingKey;
    equals: unknown;
    disabledReason?: string;
};

export type SettingPropertySchema<T = unknown> = {
    key: SettingKey;
    type: SettingPrimitiveType;
    default: T;
    title: string;
    description?: string;
    markdownDescription?: string;
    enum?: readonly T[];
    enumItemLabels?: readonly string[];
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
    category: SettingsTab;
    group: string;
    order: number;
    tags?: readonly string[];
    keywords?: readonly string[];
    when?: SettingWhen;
    ui?: SettingUISchema;
};

export type SettingGroup = {
    id: string;
    tab: SettingsTab;
    label: string;
    description?: string;
    order: number;
};

export type SettingViewModel = {
    key: SettingKey;
    id: SettingKey;
    tab: SettingsTab;
    group: string;
    label: string;
    description?: string;
    type: SettingPresentation;
    value: unknown;
    defaultValue: unknown;
    options: SettingOption[];
    min?: number;
    max?: number;
    step?: number;
    format?: SettingFormat;
    placeholder?: string;
    inputType?: 'text' | 'number';
    component?: SettingCustomComponent;
    inlineInput?: boolean;
    condition?: SettingWhen;
    disabled: boolean;
    disabledReason?: string;
    order: number;
    schema: SettingPropertySchema;
};

export type SettingsSnapshot = UserSettings;

export function resolveNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
        if (current && typeof current === 'object' && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

export function setNestedValue<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
    const keys = path.split('.');
    const lastKey = keys.pop();

    if (!lastKey) return obj;

    let current: Record<string, unknown> = obj;
    for (const key of keys) {
        const next = current[key];
        if (!next || typeof next !== 'object') {
            current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
    return obj;
}

export function isConditionMet(
    setting: SettingPropertySchema | SettingViewModel,
    settingsSnapshot: SettingsSnapshot
): boolean {
    const when = 'schema' in setting ? setting.condition : setting.when;
    if (!when) return true;
    return resolveNestedValue(settingsSnapshot, when.key) === when.equals;
}

export function inferPresentation(schema: SettingPropertySchema): SettingPresentation {
    if (schema.ui?.presentation) return schema.ui.presentation;
    if (schema.ui?.component) return 'custom';
    if (schema.enum) return 'select';
    if (schema.type === 'boolean') return 'switch';
    if (schema.type === 'number') return 'slider';
    return 'input';
}

export function createSettingOptions(schema: SettingPropertySchema): SettingOption[] {
    if (!schema.enum) return [];

    return schema.enum.map((value, index) => ({
        value: String(value),
        label: schema.enumItemLabels?.[index] ?? String(value)
    }));
}

export function createSettingViewModel(
    schema: SettingPropertySchema,
    settingsSnapshot: SettingsSnapshot,
    options: { includeConditionallyHidden?: boolean } = {}
): SettingViewModel | undefined {
    const conditionMet = isConditionMet(schema, settingsSnapshot);
    if (!conditionMet && !options.includeConditionallyHidden) return undefined;

    const presentation = inferPresentation(schema);
    const disabled = Boolean(schema.when && !conditionMet);

    return {
        key: schema.key,
        id: schema.key,
        tab: schema.category,
        group: schema.group,
        label: schema.title,
        description: schema.description,
        type: presentation,
        value: resolveNestedValue(settingsSnapshot, schema.key),
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
        disabled,
        disabledReason: disabled ? schema.when?.disabledReason : undefined,
        order: schema.order,
        schema
    };
}

export function normalizeSettingValue(schema: SettingPropertySchema, value: unknown): unknown {
    if (schema.type === 'boolean') return Boolean(value);

    if (schema.type === 'number') {
        let nextValue = Number(value);
        if (Number.isNaN(nextValue)) nextValue = Number(schema.default ?? 0);
        if (typeof schema.minimum === 'number') nextValue = Math.max(schema.minimum, nextValue);
        if (typeof schema.maximum === 'number') nextValue = Math.min(schema.maximum, nextValue);
        return nextValue;
    }

    if (schema.enum?.length) {
        const nextValue = String(value ?? '');
        const allowedValues = schema.enum.map((item) => String(item));
        return allowedValues.includes(nextValue) ? nextValue : schema.default;
    }

    return String(value ?? '');
}

export function formatSettingValue(value: unknown, format?: SettingFormat): string {
    if (typeof value !== 'number') return String(value ?? '');

    if (format === 'ratio-percentage') return `${Math.round(value * 100)}%`;
    if (format === 'percentage') return `${value}%`;
    if (format === 'px') return `${value}px`;
    return String(value);
}
