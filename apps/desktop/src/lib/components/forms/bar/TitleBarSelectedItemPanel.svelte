<script lang="ts" module>
    import { Button } from '$ui/button';
    import { Badge } from '$ui/badge';
    import { Switch } from '$ui/switch';
    import * as Tooltip from '$ui/tooltip';
    import { MENU_SERVICE } from '$lib/menus';
    import { inject } from '$lib/utils/context';
    import {
        moveTitleBarItemByDirection,
        setTitleBarItemEnabled,
        type BarConfig,
        type BarSection,
        type TitleBarItemConfig
    } from '$lib/settings/Layout';
    import { getTitleBarContribution } from '$lib/components/layout/titlebarContributions';
    import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-svelte';

    type FlatTitleBarItem = {
        item: TitleBarItemConfig;
        section: BarSection;
        index: number;
    };
</script>

<script lang="ts">
    import { onDestroy } from 'svelte';
    import { fade, scale, slide } from 'svelte/transition';

    const menuService = inject(MENU_SERVICE);

    let {
        config = $bindable(),
        selectedItemId = $bindable(null),
        editing = false
    }: {
        config: BarConfig;
        selectedItemId: string | null;
        editing?: boolean;
    } = $props();

    let menuChangeVersion = $state(0);
    const disposable = menuService.onDidChange(() => {
        menuChangeVersion += 1;
    });

    onDestroy(() => disposable.dispose());

    const sections: BarSection[] = ['left', 'center', 'right'];
    const sectionLabels: Record<BarSection, string> = {
        left: '左侧',
        center: '中间',
        right: '右侧'
    };

    const flatItems = $derived.by(() =>
        sections.flatMap((section) =>
            [...config[section]]
                .sort((left, right) => left.order - right.order)
                .map((item, index) => ({ item, section, index }))
        )
    );
    const selectedIndex = $derived(flatItems.findIndex(({ item }) => item.id === selectedItemId));
    const selectedEntry = $derived<FlatTitleBarItem | null>(
        selectedIndex >= 0 ? flatItems[selectedIndex] : null
    );
    const selectedContribution = $derived.by(() => {
        menuChangeVersion;
        if (!selectedEntry) return null;
        return getTitleBarContribution(selectedEntry.item.contributionId, menuService);
    });
    const selectedTitle = $derived.by(() => {
        menuChangeVersion;
        if (!selectedEntry) return '';
        if (!selectedContribution?.menuContribution) {
            return selectedContribution?.title ?? '未知按钮';
        }
        return menuService.getDisplayTitle(selectedContribution.menuContribution);
    });
    const selectedDescription = $derived(
        selectedContribution?.description ??
            selectedContribution?.menuContribution?.description ??
            getFallbackDescription(selectedContribution?.category)
    );
    const canSelectPrevious = $derived(editing && selectedIndex > 0);
    const canSelectNext = $derived(editing && selectedIndex >= 0 && selectedIndex < flatItems.length - 1);
    const canMoveLeft = $derived(Boolean(editing && selectedIndex > 0));
    const canMoveRight = $derived(editing && selectedIndex >= 0 && selectedIndex < flatItems.length - 1);

    function getFallbackDescription(category?: string) {
        if (category === 'navigation') return '用于访问应用中的常用页面。';
        if (category === 'window') return '用于控制当前应用窗口。';
        if (category === 'zoom') return '用于调整应用显示比例。';
        if (category === 'theme') return '用于切换外观显示状态。';
        return '标题栏中的内置功能按钮。';
    }

    function selectOffset(offset: number) {
        if (!editing) return;
        const next = flatItems[selectedIndex + offset];
        if (!next) return;
        selectedItemId = next.item.id;
    }

    function setEnabled(enabled: boolean) {
        if (!editing || !selectedEntry) return;
        config = setTitleBarItemEnabled(config, selectedEntry.item.id, enabled);
    }

    function move(offset: number) {
        if (!editing || !selectedEntry) return;
        config = moveTitleBarItemByDirection(
            config,
            selectedEntry.section,
            selectedEntry.index,
            offset as -1 | 1
        );
    }
</script>

<Tooltip.Provider>
    <div class="border-border bg-muted/30 rounded-lg border p-3">
        {#if !editing}
            <p class="text-muted-foreground text-sm" transition:slide>点击编辑以配置标题栏</p>
        {:else if !selectedEntry}
            <p class="text-muted-foreground text-sm" transition:slide>没有可配置的标题栏按钮</p>
        {:else}
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" transition:slide>
                <div class="min-w-0 space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <h3 class="truncate text-sm font-medium">{selectedTitle}</h3>
                        <Badge variant={selectedEntry.item.enabled ? 'default' : 'secondary'}>
                            {selectedEntry.item.enabled ? '已启用' : '未启用'}
                        </Badge>
                        <Badge variant="outline">{sectionLabels[selectedEntry.section]}</Badge>
                        <p class="text-muted-foreground line-clamp-2 text-sm">
                            {selectedDescription}
                        </p>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <label class="flex h-8 items-center gap-2 rounded-md border px-2 text-sm">
                        <Switch
                            size="sm"
                            checked={selectedEntry.item.enabled}
                            onCheckedChange={setEnabled}
                        />
                        启用
                    </label>

                    <div class="flex items-center gap-1">
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onclick={() => selectOffset(-1)}
                                    disabled={!canSelectPrevious}
                                    aria-label="选中上一个按钮"
                                >
                                    <ChevronLeft class="size-4" />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>上一个</Tooltip.Content>
                        </Tooltip.Root>

                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onclick={() => selectOffset(1)}
                                    disabled={!canSelectNext}
                                    aria-label="选中下一个按钮"
                                >
                                    <ChevronRight class="size-4" />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>下一个</Tooltip.Content>
                        </Tooltip.Root>
                    </div>

                    <div class="flex items-center gap-1">
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onclick={() => move(-1)}
                                    disabled={!canMoveLeft}
                                    aria-label="左移按钮"
                                >
                                    <ArrowLeft class="size-4" />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>左移</Tooltip.Content>
                        </Tooltip.Root>

                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onclick={() => move(1)}
                                    disabled={!canMoveRight}
                                    aria-label="右移按钮"
                                >
                                    <ArrowRight class="size-4" />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>右移</Tooltip.Content>
                        </Tooltip.Root>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</Tooltip.Provider>
