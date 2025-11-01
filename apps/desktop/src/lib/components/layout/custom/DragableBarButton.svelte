<script lang="ts" module>
    import type { ButtonConfig } from '$lib/settings/Layout';
    import { cn } from '$lib/utils';
    import type { Component } from 'svelte';
    import UtilButton from '../util-btn';
</script>

<script lang="ts">
    import { Button } from '$ui/button';
    import { Badge } from '$ui/badge';
    import { GripVertical, X, Eye, EyeOff } from 'lucide-svelte';

    const {
        appTitle,
        config,
        className = 'size-6',
        btnDisabled = false,
        iconClass = 'size-4',
        editable = true,
        beingDragged = false,
        onDragStart,
        onDragEnd,
        onToggle,
        onRemove
    }: {
        appTitle: string;
        config: ButtonConfig;
        className?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        editable?: boolean;
        beingDragged?: boolean;
        onDragStart: () => void;
        onDragEnd: () => void;
        onToggle: () => void;
        onRemove: () => void;
    } = $props();

    function getButtonProps() {
        const _props: Record<string, any> = {
            name: config.name,
            className: cn(config.customProps?.className, className),
            iconClass: cn(config.customProps?.iconClass, iconClass),
            disabled: btnDisabled
        };

        return _props;
    }

    function getTextProps() {
        const _props: Record<string, any> = {
            name: config.name,
            disabled: btnDisabled,
            appTitle
        };

        return _props;
    }

    function getProps() {
        const _props = (() => {
            if (config.mode === 'text') {
                return getTextProps();
            } else if (config.mode === 'icon') {
                return getButtonProps();
            } else {
                // 默认作为 icon mode
                return getButtonProps();
            }
        })();

        const needsAppTitle = config.type.startsWith('app');
        if (needsAppTitle) {
            _props.appTitle = appTitle;
        }

        return _props;
    }

    const Btn: Component = UtilButton[config.type];

    function handleDragStart(e: DragEvent) {
        if (!editable) {
            e.preventDefault();
            return;
        }
        onDragStart();
    }

    function handleDragEnd() {
        onDragEnd();
    }

    function handleToggle(e: Event) {
        if (!editable) return;
        e.stopPropagation();
        onToggle();
    }

    function handleRemove(e: Event) {
        if (!editable) return;
        e.stopPropagation();
        onRemove();
    }
</script>

{#if editable}
    <!-- 编辑模式：显示为可拖拽的Badge -->
    <div
        class={cn('group relative inline-flex items-center transition-all duration-200', {
            'scale-95 opacity-50': beingDragged,
            'cursor-move': editable
        })}
        draggable={editable}
        ondragstart={handleDragStart}
        ondragend={handleDragEnd}
        role="button"
        tabindex="0"
        aria-label="拖拽 {config.type} 按钮"
    >
        <Badge
            variant={config.enabled ? 'default' : 'secondary'}
            class={cn(
                'flex select-none items-center gap-1 pr-1 text-xs transition-all hover:scale-105',
                {
                    'cursor-move': editable
                }
            )}
            onclick={handleToggle}
        >
            {#if editable}
                <GripVertical class="h-3 w-3 opacity-50" />
            {/if}
            {config.type}
            {#if editable}
                <button
                    class="ml-1 opacity-60 transition-opacity hover:opacity-100"
                    onclick={handleToggle}
                    aria-label="切换按钮状态"
                >
                    {#if config.enabled}
                        <Eye class="h-3 w-3" />
                    {:else}
                        <EyeOff class="h-3 w-3" />
                    {/if}
                </button>
            {/if}
        </Badge>

        {#if editable}
            <Button
                variant="ghost"
                size="sm"
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute -right-2 -top-2 h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onclick={handleRemove}
                title="删除此按钮"
                aria-label="删除 {config.type} 按钮"
            >
                <X class="h-3 w-3" />
            </Button>
        {/if}
    </div>
{:else}
    <!-- 非编辑模式：正常显示按钮 -->
    {#if config.enabled}
        <Btn {appTitle} {...getProps()} />
    {/if}
{/if}

<style>
</style>
