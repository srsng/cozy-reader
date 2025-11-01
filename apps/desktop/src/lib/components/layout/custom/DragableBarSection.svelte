<script lang="ts" module>
    import type { ButtonConfig } from '$lib/settings/Layout';
    import { cn } from '$lib/utils';
</script>

<script lang="ts">
    import DragableBarButton from './DragableBarButton.svelte';

    const {
        appTitle,
        buttons,
        section,
        className = '',
        btnClass = '',
        btnDisabled = false,
        iconClass = 'size-4',
        editable = true,
        draggedButton = null,
        dragOverSection = null,
        onDragStart,
        onDragEnd,
        onDragOver,
        onDragLeave,
        onDrop,
        onButtonToggle,
        onButtonRemove
    }: {
        appTitle: string;
        buttons: ButtonConfig[];
        section: string;
        className?: string;
        btnClass?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        editable?: boolean;
        draggedButton?: ButtonConfig | null;
        dragOverSection?: string | null;
        onDragStart: (button: ButtonConfig, section: string) => void;
        onDragEnd: () => void;
        onDragOver: (section: string) => void;
        onDragLeave: () => void;
        onDrop: (section: string, index?: number) => void;
        onButtonToggle: (button: ButtonConfig, section: string) => void;
        onButtonRemove: (button: ButtonConfig, section: string) => void;
    } = $props();

    // 按order排序
    const sortedButtons = $derived([...buttons].sort((a, b) => a.order - b.order));

    // 拖拽区域样式
    const isDragOver = $derived(dragOverSection === section);
    const canDrop = $derived(draggedButton !== null && editable);

    function handleDragOver(e: DragEvent) {
        if (!canDrop) return;
        e.preventDefault();
        onDragOver(section);
    }

    function handleDragLeave(e: DragEvent) {
        if (!canDrop) return;
        // 只有当鼠标真正离开容器时才触发
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            onDragLeave();
        }
    }

    function handleDrop(e: DragEvent) {
        if (!canDrop) return;
        e.preventDefault();

        // 计算插入位置
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const children = Array.from((e.currentTarget as HTMLElement).children);

        let insertIndex = sortedButtons.length;

        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            const childRect = child.getBoundingClientRect();
            const childX = childRect.left + childRect.width / 2;

            if (e.clientX < childX) {
                insertIndex = i;
                break;
            }
        }

        onDrop(section, insertIndex);
    }

    function handleButtonDragStart(button: ButtonConfig) {
        onDragStart(button, section);
    }

    function handleButtonToggle(button: ButtonConfig) {
        onButtonToggle(button, section);
    }

    function handleButtonRemove(button: ButtonConfig) {
        onButtonRemove(button, section);
    }
</script>

<div
    class={cn(className, 'draggable-bar-section', {
        'drag-over': isDragOver && canDrop,
        'drop-zone': canDrop
    })}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="region"
    aria-label="{section} 按钮区域"
>
    {#each sortedButtons as button (button.name)}
        <DragableBarButton
            config={button}
            className={btnClass}
            {appTitle}
            {btnDisabled}
            {iconClass}
            {editable}
            beingDragged={draggedButton?.name === button.name}
            onDragStart={() => handleButtonDragStart(button)}
            {onDragEnd}
            onToggle={() => handleButtonToggle(button)}
            onRemove={() => handleButtonRemove(button)}
        />
    {/each}

    {#if sortedButtons.length === 0 && canDrop}
        <div class="empty-drop-zone">
            <span class="text-muted-foreground text-xs">拖拽按钮到此处</span>
        </div>
    {/if}
</div>

<style>
    .draggable-bar-section {
        position: relative;
        transition: all 0.2s ease;
        min-height: 32px;
    }

    .draggable-bar-section.drop-zone {
        border: 2px dashed transparent;
        border-radius: 4px;
        padding: 2px;
    }

    .draggable-bar-section.drag-over {
        border-color: hsl(var(--primary));
        background-color: hsl(var(--primary) / 0.05);
    }

    .empty-drop-zone {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 32px;
        padding: 8px 16px;
        border: 2px dashed hsl(var(--muted-foreground) / 0.3);
        border-radius: 4px;
        background-color: hsl(var(--muted) / 0.3);
    }

    .drag-over .empty-drop-zone {
        border-color: hsl(var(--primary));
        background-color: hsl(var(--primary) / 0.1);
    }
</style>
