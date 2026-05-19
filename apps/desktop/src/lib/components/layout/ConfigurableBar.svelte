<script lang="ts" module>
    import { cn } from '$lib/utils';
    import { type VariantProps, tv } from 'tailwind-variants';
    import type { BarConfig } from '$lib/settings/Layout';
    import BarSection from './BarSection.svelte';
    import { inject } from '$lib/utils/context';
    import { APP_STATE } from '$lib/stores/appState';
    import {
        titleBarButtonClass,
        titleBarButtonGroupClass,
        titleBarCenterButtonClass,
        titleBarCenterButtonGroupClass,
        titleBarCenterTextButtonClass,
        titleBarContentClass,
        titleBarSectionClasses,
        titleBarTextButtonClass
    } from './titlebarLayout';

    export const barVariants = tv({
        base: '',
        variants: {
            variant: {
                default: '',
                titlebar: '',
                footbar: '',
                sidebar: ''
            },
            size: {
                default: ''
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    });

    export type BarVariant = VariantProps<typeof barVariants>['variant'];
    export type BarSize = VariantProps<typeof barVariants>['size'];

    export type Barprops = {
        variant?: BarVariant;
        size?: BarSize;
    };
</script>

<script lang="ts">
    const appState = inject(APP_STATE);
    const {
        config,
        className = '',
        sectionClass = '',
        groupClass = '',
        btnClass = titleBarButtonClass,
        textBtnClass = titleBarTextButtonClass,
        btnDisabled = false,
        iconClass = 'size-4',
        mode = 'runtime',
        editing = false,
        selectedItemId = null,
        onSelect,
        ...others
    }: {
        config: BarConfig;
        className?: string;
        sectionClass?: string;
        groupClass?: string;
        btnClass?: string;
        textBtnClass?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        mode?: 'runtime' | 'preview';
        editing?: boolean;
        selectedItemId?: string | null;
        onSelect?: (item: BarConfig['left'][number]) => void;
        'data-tauri-drag-region'?: boolean;
    } = $props();

    const leftClass = cn(sectionClass, titleBarSectionClasses.left);
    const centerClass = cn(sectionClass, titleBarSectionClasses.center);
    const rightClass = cn(sectionClass, titleBarSectionClasses.right);
    const mergedGroupClass = cn(titleBarButtonGroupClass, groupClass);
    const mergedCenterGroupClass = cn(titleBarCenterButtonGroupClass, groupClass);
</script>

<div class={cn(titleBarContentClass, className)}>
    <BarSection
        appTitle={$appState.appTitle}
        buttons={config.left}
        className={leftClass}
        groupClass={mergedGroupClass}
        {btnClass}
        {textBtnClass}
        {btnDisabled}
        {iconClass}
        {mode}
        {editing}
        {selectedItemId}
        {onSelect}
        {...others}
    />
    <BarSection
        appTitle={$appState.appTitle}
        buttons={config.center}
        className={centerClass}
        groupClass={mergedCenterGroupClass}
        btnClass={titleBarCenterButtonClass}
        textBtnClass={titleBarCenterTextButtonClass}
        {btnDisabled}
        {iconClass}
        {mode}
        {editing}
        {selectedItemId}
        {onSelect}
        {...others}
    />
    <BarSection
        appTitle={$appState.appTitle}
        buttons={config.right}
        className={rightClass}
        groupClass={mergedGroupClass}
        {btnClass}
        {textBtnClass}
        {btnDisabled}
        {iconClass}
        {mode}
        {editing}
        {selectedItemId}
        {onSelect}
        {...others}
    />
</div>
