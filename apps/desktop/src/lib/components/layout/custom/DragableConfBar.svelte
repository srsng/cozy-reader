<script lang="ts" module>
    import { cn } from '$lib/utils';
    import { type VariantProps, tv } from 'tailwind-variants';
    import type { BarConfig, ButtonConfig } from '$lib/settings/Layout';
    import { inject } from '$lib/utils/context';
    import { APP_STATE } from '$lib/stores/appState';

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
</script>

<script lang="ts">
    import DragableBarSection from './DragableBarSection.svelte';

    const appState = inject(APP_STATE);

    const {
        config,
        className = '',
        sectionClass = '',
        btnClass = 'size-6',
        btnDisabled = false,
        iconClass = 'size-4',
        editable = true,
        ...others
    }: {
        config: BarConfig;
        className?: string;
        sectionClass?: string;
        btnClass?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        editable?: boolean;
    } = $props();

    const lr_class = cn(sectionClass, 'flex items-center gap-1');
    const md_class = cn(sectionClass, 'flex flex-1 items-center justify-center overflow-hidden');

    // 拖拽状态
    let draggedButton: ButtonConfig | null = $state(null);
    let draggedFromSection: string | null = $state(null);
    let dragOverSection: string | null = $state(null);

    function handleDragStart(button: ButtonConfig, section: string) {
        if (!editable) return;
        draggedButton = button;
        draggedFromSection = section;
    }

    function handleDragEnd() {
        draggedButton = null;
        draggedFromSection = null;
        dragOverSection = null;
    }

    function handleDragOver(section: string) {
        if (!editable || !draggedButton) return;
        dragOverSection = section;
    }

    function handleDragLeave() {
        if (!editable) return;
        dragOverSection = null;
    }

    function handleDrop(section: string, index?: number) {
        if (!editable || !draggedButton || !draggedFromSection) return;

        // 创建新的配置
        const newConfig = { ...config };

        // 从原位置移除
        if (draggedFromSection === 'left') {
            newConfig.left = newConfig.left.filter((b) => b.name !== draggedButton!.name);
        } else if (draggedFromSection === 'center') {
            newConfig.center = newConfig.center.filter((b) => b.name !== draggedButton!.name);
        } else if (draggedFromSection === 'right') {
            newConfig.right = newConfig.right.filter((b) => b.name !== draggedButton!.name);
        }

        // 添加到新位置
        const targetIndex = index ?? 0;
        if (section === 'left') {
            newConfig.left.splice(targetIndex, 0, draggedButton);
        } else if (section === 'center') {
            newConfig.center.splice(targetIndex, 0, draggedButton);
        } else if (section === 'right') {
            newConfig.right.splice(targetIndex, 0, draggedButton);
        }

        // 重新排序
        newConfig.left.forEach((btn, i) => (btn.order = i));
        newConfig.center.forEach((btn, i) => (btn.order = i));
        newConfig.right.forEach((btn, i) => (btn.order = i));

        // 直接更新配置对象
        config.left = newConfig.left;
        config.center = newConfig.center;
        config.right = newConfig.right;

        handleDragEnd();
    }

    function handleButtonToggle(button: ButtonConfig, section: string) {
        if (!editable) return;
        const sectionKey = section as 'left' | 'center' | 'right';
        const buttonIndex = config[sectionKey].findIndex((btn) => btn.name === button.name);
        if (buttonIndex !== -1) {
            config[sectionKey][buttonIndex].enabled = !config[sectionKey][buttonIndex].enabled;
        }
    }

    function handleButtonRemove(button: ButtonConfig, section: string) {
        if (!editable) return;
        const sectionKey = section as 'left' | 'center' | 'right';
        config[sectionKey] = config[sectionKey].filter((btn) => btn.name !== button.name);
        // 重新排序
        config[sectionKey].forEach((btn, index) => {
            btn.order = index;
        });
    }
</script>

<div class={cn('draggable-conf-bar', className)}>
    <DragableBarSection
        appTitle={$appState.appTitle}
        buttons={config.left}
        section="left"
        className={lr_class}
        {btnClass}
        {btnDisabled}
        {iconClass}
        {editable}
        {draggedButton}
        {dragOverSection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onButtonToggle={handleButtonToggle}
        onButtonRemove={handleButtonRemove}
        {...others}
    />
    <DragableBarSection
        appTitle={$appState.appTitle}
        buttons={config.center}
        section="center"
        className={md_class}
        {btnClass}
        {btnDisabled}
        {iconClass}
        {editable}
        {draggedButton}
        {dragOverSection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onButtonToggle={handleButtonToggle}
        onButtonRemove={handleButtonRemove}
        {...others}
    />
    <DragableBarSection
        appTitle={$appState.appTitle}
        buttons={config.right}
        section="right"
        className={lr_class}
        {btnClass}
        {btnDisabled}
        {iconClass}
        {editable}
        {draggedButton}
        {dragOverSection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onButtonToggle={handleButtonToggle}
        onButtonRemove={handleButtonRemove}
        {...others}
    />
</div>

<style>
    .draggable-conf-bar {
        display: flex;
        width: 100%;
    }
</style>
