import type { CommandInvocation } from '$lib/commands/types';
import type { ContextKeyExpression, ContextKeyInspection } from '$lib/context-keys';

export type MenuContributionSource = 'default' | 'feature' | 'user' | 'legacy';

export const MenuId = {
    CommandPalette: 'commandPalette',
    Reader: 'reader',
    Settings: 'settings',
    TitleBar: 'titleBar'
} as const;

export type MenuId = (typeof MenuId)[keyof typeof MenuId];

export type MenuCategory = 'application' | 'navigation' | 'reader' | 'theme' | 'window' | 'zoom';

export type MenuToggledState = {
    when: ContextKeyExpression;
    title?: string;
    description?: string;
};

export type MenuContribution = {
    id: string;
    menu: MenuId;
    title: string;
    description?: string;
    category: MenuCategory;
    keywords?: readonly string[];
    defaultShortcut?: string;
    when?: string;
    enablement?: string;
    keepOpen?: boolean;
    order?: number;
    source?: MenuContributionSource;
    toggled?: MenuToggledState;
    invocation: CommandInvocation;
};

export type MenuContributionInspection = {
    contribution: MenuContribution;
    visible: boolean;
    enabled: boolean;
    toggled: boolean;
    commandExists: boolean;
    visibility: ContextKeyInspection;
    enablement: ContextKeyInspection;
    toggledInspection?: ContextKeyInspection;
};
