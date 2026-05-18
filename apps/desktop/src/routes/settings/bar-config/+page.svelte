<script lang="ts" module>
    import { Button } from '$ui/button';
    import {
        Card,
        CardContent,
        CardDescription,
        CardFooter,
        CardHeader,
        CardTitle
    } from '$ui/card';
    import { Badge } from '$ui/badge';
    import {
        cloneBarConfig,
        completeTitleBarConfig,
        DefaultTitleBarConfig,
        normalizeTitleBarConfig,
        type BarConfig,
        type BarSection,
        type TitleBarItemConfig
    } from '$lib/settings/Layout';
    import TitleBarPreview from '$lib/components/forms/bar/TitleBarPreview.svelte';
    import TitleBarSelectedItemPanel from '$lib/components/forms/bar/TitleBarSelectedItemPanel.svelte';
    import { MENU_SERVICE } from '$lib/menus';
    import { getAvailableTitleBarContributions } from '$lib/components/layout/titlebarContributions';
    import { inject } from '$lib/utils/context';
    import { forceSaveUserSettings, USER_SETTINGS } from '$lib/stores/userSettings';
    import { Pencil, RotateCcw, Save, Undo2 } from 'lucide-svelte';
    import { onDestroy } from 'svelte';
    import { fade, slide } from 'svelte/transition';
</script>

<script lang="ts">
    const userSettings = inject(USER_SETTINGS);
    const menuService = inject(MENU_SERVICE);

    let menuChangeVersion = $state(0);
    const disposable = menuService.onDidChange(() => {
        menuChangeVersion += 1;
    });

    onDestroy(() => disposable.dispose());

    const contributions = $derived.by(() => {
        menuChangeVersion;
        return getAvailableTitleBarContributions(menuService);
    });
    const appliedConfig = $derived(
        completeTitleBarConfig($userSettings.layout.layoutConfigs.titlebar, contributions)
    );

    let draftConfig: BarConfig = $state({ left: [], center: [], right: [] });
    let editing = $state(false);
    let selectedItemId: string | null = $state(null);
    let completedContributionsKey = $state('');
    let draftInitialized = $state(false);

    const appliedConfigJson = $derived(JSON.stringify(normalizeTitleBarConfig(appliedConfig)));
    const draftConfigJson = $derived(JSON.stringify(normalizeTitleBarConfig(draftConfig)));
    const dirty = $derived(draftConfigJson !== appliedConfigJson);
    const totalItems = $derived(flatItems(draftConfig).length);
    const enabledItems = $derived(flatItems(draftConfig).filter((item) => item.enabled).length);
    const contributionsKey = $derived(
        contributions.map((contribution) => contribution.id).join('|')
    );

    $effect(() => {
        if (!draftInitialized) {
            draftConfig = cloneBarConfig(appliedConfig);
            completedContributionsKey = contributionsKey;
            draftInitialized = true;
            return;
        }

        if (contributionsKey === completedContributionsKey) return;
        draftConfig = cloneBarConfig(completeTitleBarConfig(draftConfig, contributions));
        completedContributionsKey = contributionsKey;
        ensureSelectedItem();
    });

    function flatItems(config: BarConfig) {
        const sections: BarSection[] = ['left', 'center', 'right'];
        return sections.flatMap((section) =>
            [...config[section]].sort((left, right) => left.order - right.order)
        );
    }

    function firstItem(config: BarConfig) {
        return flatItems(config)[0] ?? null;
    }

    function selectItem(item: TitleBarItemConfig) {
        selectedItemId = item.id;
    }

    function ensureSelectedItem() {
        if (!editing) return;
        const items = flatItems(draftConfig);
        if (selectedItemId && items.some((item) => item.id === selectedItemId)) return;
        selectedItemId = items[0]?.id ?? null;
    }

    function startEditing() {
        editing = true;
        ensureSelectedItem();
    }

    function resetToDefaultDraft() {
        draftConfig = cloneBarConfig(completeTitleBarConfig(DefaultTitleBarConfig, contributions));
        selectedItemId = firstItem(draftConfig)?.id ?? null;
    }

    function cancelEditing() {
        draftConfig = cloneBarConfig(appliedConfig);
        selectedItemId = null;
        editing = false;
    }

    async function saveDraft() {
        const nextConfig = cloneBarConfig(completeTitleBarConfig(draftConfig, contributions));
        userSettings.update((settings) => ({
            ...settings,
            layout: {
                ...settings.layout,
                layoutConfigs: {
                    ...settings.layout.layoutConfigs,
                    titlebar: nextConfig
                }
            }
        }));
        await forceSaveUserSettings(userSettings);
        editing = false;
        selectedItemId = null;
    }
</script>

<Card>
    <CardHeader>
        <CardTitle>标题栏配置</CardTitle>
        <CardDescription>
            在预览中选择按钮，调整启用状态和同区域顺序后应用到实际标题栏。
        </CardDescription>
    </CardHeader>

    <CardContent class="space-y-3">
        <TitleBarPreview config={draftConfig} {editing} {selectedItemId} onSelect={selectItem} />
        <TitleBarSelectedItemPanel bind:config={draftConfig} bind:selectedItemId {editing} />
    </CardContent>

    <CardFooter
        class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
        <div class="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            <Badge variant={dirty ? 'default' : 'outline'}
                >{dirty ? '有未应用更改' : '已应用'}</Badge
            >
            <span>{enabledItems} / {totalItems} 个按钮已启用</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
            {#if editing}
                <Button variant="default" onclick={saveDraft} disabled={!dirty}>
                    <Save class="size-4" />
                    保存
                </Button>
                <Button variant="outline" onclick={cancelEditing}>
                    <Undo2 class="size-4" />
                    取消
                </Button>
                <Button variant="outline" onclick={resetToDefaultDraft}>
                    <RotateCcw class="size-4" />
                    恢复默认
                </Button>
            {:else}
                <Button variant="outline" onclick={startEditing}>
                    <Pencil class="size-4" />
                    编辑
                </Button>
            {/if}
        </div>
    </CardFooter>
</Card>
