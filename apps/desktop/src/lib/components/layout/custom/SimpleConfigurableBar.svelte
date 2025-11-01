<script lang="ts" module>
    import type { BarConfig, ButtonConfig } from '$lib/settings/Layout';
    import DraggableBarSection from './DraggableBarSection.svelte';
    import { cn } from '$lib/utils';
    import { APP_STATE } from '$lib/stores/appState';
    import { inject } from '$lib/utils/context';
</script>

<script lang="ts">
    const appState = inject(APP_STATE);

    let {
        config = $bindable(),
        className = '',
        sectionClass = '',
        btnClass = 'size-6',
        btnDisabled = false,
        iconClass = 'size-4',
        editable = false,
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

    // 拖拽状态
    let draggedButton: {
        button: ButtonConfig;
        section: 'left' | 'center' | 'right';
        index: number;
    } | null = $state(null);
    let dragOverTarget: { section: 'left' | 'center' | 'right'; index: number } | null =
        $state(null);
    let isDragging = $state(false);

    // 获取所有按钮的扁平化列表，用于拖拽数据传输
    function getAllButtons() {
        const allButtons: Array<{
            button: ButtonConfig;
            section: 'left' | 'center' | 'right';
            index: number;
        }> = [];

        config.left.forEach((btn, index) => {
            if (btn.enabled) allButtons.push({ button: btn, section: 'left', index });
        });
        config.center.forEach((btn, index) => {
            if (btn.enabled) allButtons.push({ button: btn, section: 'center', index });
        });
        config.right.forEach((btn, index) => {
            if (btn.enabled) allButtons.push({ button: btn, section: 'right', index });
        });

        return allButtons;
    }

    // 处理跨section拖拽
    function handleCrossSectionDrag(
        fromSection: 'left' | 'center' | 'right',
        fromSortedIndex: number,
        toSection: 'left' | 'center' | 'right',
        toSortedIndex: number
    ) {
        if (!editable) return;

        // 获取源section的排序按钮
        const fromSortedButtons = [...config[fromSection]].sort((a, b) => a.order - b.order);
        const movedButton = fromSortedButtons[fromSortedIndex];
        if (!movedButton) return;

        // 从源section移除按钮
        const sourceButtons = config[fromSection].filter((btn) => btn.name !== movedButton.name);
        // 重新排序
        sourceButtons.forEach((btn, index) => {
            btn.order = index;
        });
        config[fromSection] = sourceButtons;

        // 获取目标section的排序按钮
        const toSortedButtons = [...config[toSection]].sort((a, b) => a.order - b.order);
        // 插入到目标位置
        toSortedButtons.splice(toSortedIndex, 0, movedButton);
        // 重新设置order
        toSortedButtons.forEach((btn, index) => {
            btn.order = index;
        });
        config[toSection] = toSortedButtons;
    }

    // 处理同section内拖拽
    function handleSameSectionReorder(
        section: 'left' | 'center' | 'right',
        fromSortedIndex: number,
        toSortedIndex: number
    ) {
        if (!editable) return;

        // 获取排序后的按钮数组
        const sortedButtons = [...config[section]].sort((a, b) => a.order - b.order);
        // 移动按钮
        const [movedButton] = sortedButtons.splice(fromSortedIndex, 1);
        sortedButtons.splice(toSortedIndex, 0, movedButton);

        // 重新设置order属性
        sortedButtons.forEach((btn, index) => {
            btn.order = index;
        });

        config[section] = sortedButtons;
    }

    // 统一的拖拽处理函数
    function handleGlobalDrop(
        fromSection: 'left' | 'center' | 'right',
        fromSortedIndex: number,
        toSection: 'left' | 'center' | 'right',
        toSortedIndex: number
    ) {
        if (fromSection === toSection) {
            handleSameSectionReorder(fromSection, fromSortedIndex, toSortedIndex);
        } else {
            handleCrossSectionDrag(fromSection, fromSortedIndex, toSection, toSortedIndex);
        }
    }

    // 计算样式类
    const lr_class = $derived(cn('flex-none flex items-center', sectionClass));
    const md_class = $derived(cn('flex-1 flex items-center justify-center', sectionClass));
</script>

<div class={cn('simple-configurable-bar', className)} {...others}>
    <!-- 左侧区域 -->
    <DraggableBarSection
        appTitle={$appState.appTitle}
        buttons={config.left}
        section="left"
        className={lr_class}
        {btnClass}
        {btnDisabled}
        {iconClass}
        {editable}
        bind:draggedButton
        bind:dragOverTarget
        bind:isDragging
        onGlobalDrop={handleGlobalDrop}
    />

    <!-- 中间区域 -->
    <DraggableBarSection
        appTitle={$appState.appTitle}
        buttons={config.center}
        section="center"
        className={md_class}
        {btnClass}
        {btnDisabled}
        {iconClass}
        {editable}
        bind:draggedButton
        bind:dragOverTarget
        bind:isDragging
        onGlobalDrop={handleGlobalDrop}
    />

    <!-- 右侧区域 -->
    <DraggableBarSection
        appTitle={$appState.appTitle}
        buttons={config.right}
        section="right"
        className={lr_class}
        {btnClass}
        {btnDisabled}
        {iconClass}
        {editable}
        bind:draggedButton
        bind:dragOverTarget
        bind:isDragging
        onGlobalDrop={handleGlobalDrop}
    />
</div>

<style>
    .simple-configurable-bar {
        display: flex;
        width: 100%;
        align-items: center;
        height: 100%;
    }
</style>
