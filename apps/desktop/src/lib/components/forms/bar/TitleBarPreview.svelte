<script lang="ts" module>
    import { Button } from '$ui/button';
    import { Badge } from '$ui/badge';
    import { APP_STATE } from '$lib/stores/appState';
    import { MENU_SERVICE } from '$lib/menus';
    import { inject } from '$lib/utils/context';
    import { cn } from '$lib/utils';
    import type { BarConfig, BarSection, TitleBarItemConfig } from '$lib/settings/Layout';
    import { getTitleBarContribution } from '$lib/components/layout/titlebarContributions';
</script>

<script lang="ts">
    import { onDestroy } from 'svelte';

    const appState = inject(APP_STATE);
    const menuService = inject(MENU_SERVICE);

    let {
        config,
        selectedItemId = null,
        editing = false,
        onSelect
    }: {
        config: BarConfig;
        selectedItemId?: string | null;
        editing?: boolean;
        onSelect?: (item: TitleBarItemConfig) => void;
    } = $props();

    let menuChangeVersion = $state(0);
    const disposable = menuService.onDidChange(() => {
        menuChangeVersion += 1;
    });

    onDestroy(() => disposable.dispose());

    const sections: BarSection[] = ['left', 'center', 'right'];
    const sectionClass: Record<BarSection, string> = {
        left: 'justify-start',
        center: 'min-w-0 flex-1 justify-center',
        right: 'justify-end'
    };

    function sortedItems(section: BarSection) {
        return [...config[section]].sort((left, right) => left.order - right.order);
    }

    function getContribution(item: TitleBarItemConfig) {
        menuChangeVersion;
        return getTitleBarContribution(item.contributionId, menuService);
    }

    function getTitle(item: TitleBarItemConfig) {
        const contribution = getContribution(item);
        if (!contribution?.menuContribution) return contribution?.title ?? '未知按钮';
        return menuService.getDisplayTitle(contribution.menuContribution);
    }

    function select(item: TitleBarItemConfig) {
        if (!editing) return;
        onSelect?.(item);
    }
</script>

<div class="bg-card border-muted flex h-10 w-full select-none items-center border-b px-2">
    {#each sections as section}
        <div class={cn('flex min-h-8 items-center gap-1', sectionClass[section])}>
            {#each sortedItems(section) as item (item.id)}
                {@const contribution = getContribution(item)}
                {@const Icon = contribution?.icon}
                {@const title = getTitle(item)}
                {@const isSelected = editing && selectedItemId === item.id}
                {#if contribution?.text}
                    <button
                        type="button"
                        class={cn(
                            'text-foreground max-w-48 truncate rounded-md px-2 py-1 text-sm font-medium outline-none transition-colors',
                            {
                                'cursor-pointer': editing,
                                'opacity-40': !item.enabled,
                                'outline-primary bg-primary/10 outline-2 outline-offset-0': isSelected,
                                'hover:bg-muted': editing && !isSelected
                            }
                        )}
                        tabindex={editing ? 0 : -1}
                        aria-disabled={!editing}
                        onclick={() => select(item)}
                        aria-pressed={isSelected}
                        aria-label={title}
                    >
                        {$appState.appTitle || title}
                    </button>
                {:else}
                    <Button
                        variant="bar-no-bg"
                        size="icon-sm"
                        title={title}
                        tabindex={editing ? 0 : -1}
                        aria-disabled={!editing}
                        class={cn('relative size-7 transition-colors', {
                            'cursor-pointer': editing,
                            'opacity-40': !item.enabled,
                            'outline-primary bg-primary/10 outline-2 outline-offset-0': isSelected
                        })}
                        onclick={() => select(item)}
                        aria-pressed={isSelected}
                    >
                        {#if Icon}
                            <Icon class="size-4" />
                        {:else}
                            <span class="text-xs">?</span>
                        {/if}
                    </Button>
                {/if}
            {/each}
        </div>
    {/each}
</div>