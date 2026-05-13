import type { UserSettings } from '$lib/settings';

export type SettingsTab = 'base' | 'theme' | 'reader';
export type SettingType = 'switch' | 'slider' | 'input' | 'select' | 'button-list' | 'custom';
export type StoreName = 'userSettings';

export type SettingOption<Value extends string = string> = {
    value: Value;
    label: string;
};

export type SettingCondition = {
    field: string;
    equals: unknown;
    disabledReason?: string;
};

export type OnChangeAction =
    | { kind: 'store' }
    | { kind: 'event'; name: string }
    | { kind: 'handler'; name: string };

export type SettingProps = {
    options?: SettingOption[];
    min?: number;
    max?: number;
    step?: number;
    format?: 'ratio-percentage' | 'percentage' | 'px' | 'number';
    placeholder?: string;
    inputType?: 'text' | 'number';
    component?: string;
    inlineInput?: boolean;
};

export type SettingEntry = {
    id: string;
    tab: SettingsTab;
    group: string;
    label: string;
    description?: string;
    store: StoreName;
    path: string;
    type: SettingType;
    defaultValue?: unknown;
    props?: SettingProps;
    condition?: SettingCondition;
    onChangeAction?: OnChangeAction;
    order: number;
};

export type SettingGroup = {
    id: string;
    tab: SettingsTab;
    label: string;
    description?: string;
    order: number;
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

export function isConditionMet(entry: SettingEntry, settingsSnapshot: SettingsSnapshot): boolean {
    if (!entry.condition) return true;
    return resolveNestedValue(settingsSnapshot, entry.condition.field) === entry.condition.equals;
}

export function isSearchDisabled(entry: SettingEntry, settingsSnapshot: SettingsSnapshot): boolean {
    return Boolean(entry.condition && !isConditionMet(entry, settingsSnapshot));
}

export function formatSettingValue(value: unknown, format?: SettingProps['format']): string {
    if (typeof value !== 'number') return String(value ?? '');

    if (format === 'ratio-percentage') return `${Math.round(value * 100)}%`;
    if (format === 'percentage') return `${value}%`;
    if (format === 'px') return `${value}px`;
    return String(value);
}
