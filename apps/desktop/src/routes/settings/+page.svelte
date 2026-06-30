<script lang="ts">
    import { page } from '$app/state';
    import * as Tabs from '$ui/tabs';
    import * as Empty from '$ui/empty';
    import { m } from '$lib/paraglide/messages.js';
    import { slide } from 'svelte/transition';
    import type { PageData } from './$types';
    import { saveUserSettingsManually } from '$lib/stores/userSettings';
    import { onDestroy, tick } from 'svelte';
    import SettingsGroup from '$lib/components/settings/SettingsGroup.svelte';
    import SettingsSearch from '$lib/components/settings/SettingsSearch.svelte';
    import {
        getEntriesByTab,
        getGroupsByTab,
        getSearchResultCount,
        searchEntries,
        type SettingViewModel,
        type SettingsTab
    } from '$lib/settings-registry';

    const { data }: { data: PageData } = $props();

    const tabLabels: Record<SettingsTab, string> = {
        base: m['settings.base'](),
        theme: m['settings.theme']()
        // TODO: hidden settings for tmp
        // reader: m['settings.reader']()
    };
    // TODO: hidden settings for tmp
    // const tabOrder: SettingsTab[] = ['base', 'theme', 'reader'];
    const tabOrder: SettingsTab[] = ['base', 'theme'];
    const userSettings = data.userSettings;

    let tab = $state<SettingsTab>(getRouteTab());
    let searchText = $state('');
    let debouncedSearchText = $state('');
    let activeMatchIndex = $state(0);
    let previousRouteTab = $state<SettingsTab>(getRouteTab());
    let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

    const searchResults = $derived(searchEntries(debouncedSearchText, $userSettings));
    const resultCount = $derived(getSearchResultCount(searchResults));
    const searchMode = $derived(Boolean(debouncedSearchText.trim()));
    const highlightedIds = $derived(
        searchMode ? new Set(getTabEntries(tab).map((entry) => entry.id)) : new Set<string>()
    );
    const activeEntries = $derived(getTabEntries(tab));

    $effect(() => {
        const nextSearchText = searchText;
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            debouncedSearchText = nextSearchText;
            activeMatchIndex = 0;
        }, 300);
    });

    $effect(() => {
        const routeTab = getRouteTab();
        if (routeTab !== previousRouteTab) {
            previousRouteTab = routeTab;
            if (!searchMode) tab = routeTab;
        }
    });

    $effect(() => {
        if (!searchMode || resultCount === 0) return;
        if ((searchResults.get(tab)?.length ?? 0) > 0) return;

        const firstMatchedTab = tabOrder.find(
            (tabName) => (searchResults.get(tabName)?.length ?? 0) > 0
        );
        if (firstMatchedTab && firstMatchedTab !== tab) {
            tab = firstMatchedTab;
            activeMatchIndex = 0;
        }
    });

    $effect(() => {
        if (!searchMode || resultCount === 0) return;
        debouncedSearchText;
        tab;
        scrollToActiveMatch();
    });

    onDestroy(async () => {
        await saveUserSettingsManually(data.userSettings);
    });

    function isSettingsTab(value: unknown): value is SettingsTab {
        return typeof value === 'string' && tabOrder.includes(value as SettingsTab);
    }

    function getRouteTab(): SettingsTab {
        // SvelteKit page.state is app-defined; route helpers currently store `{ tab }` there.
        // @ts-ignore
        const stateTab = page.state.tab;
        const queryTab = page.url.searchParams.get('tab');

        if (isSettingsTab(stateTab)) return stateTab;
        if (isSettingsTab(queryTab)) return queryTab;
        return 'base';
    }

    function getTabEntries(tabName: SettingsTab): SettingViewModel[] {
        if (searchMode) return searchResults.get(tabName) ?? [];
        return getEntriesByTab(tabName, $userSettings);
    }

    function getTabGroups(tabName: SettingsTab) {
        const entries = getTabEntries(tabName);
        return getGroupsByTab(tabName).filter((group) =>
            entries.some((entry) => entry.group === group.id)
        );
    }

    async function scrollToActiveMatch() {
        await tick();
        const entries = getTabEntries(tab);
        const activeEntry = entries[Math.min(activeMatchIndex, Math.max(entries.length - 1, 0))];
        if (!activeEntry) return;

        document
            .querySelector(`[data-setting-id="${activeEntry.id}"]`)
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function clearSearch() {
        searchText = '';
        debouncedSearchText = '';
        activeMatchIndex = 0;
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    }

    function handleSearchKeydown(event: KeyboardEvent) {
        if (!searchMode) return;

        if (event.key === 'Enter') {
            activeMatchIndex = 0;
            scrollToActiveMatch();
            event.preventDefault();
            return;
        }

        if (event.key === 'Escape') {
            clearSearch();
            return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

        const entries = getTabEntries(tab);
        if (entries.length === 0) return;

        activeMatchIndex =
            event.key === 'ArrowDown'
                ? (activeMatchIndex + 1) % entries.length
                : (activeMatchIndex - 1 + entries.length) % entries.length;
        scrollToActiveMatch();
        event.preventDefault();
    }
</script>

<div transition:slide class="space-y-4" role="presentation" onkeydown={handleSearchKeydown}>
    <!-- // TODO: hidden settings for tmp -->
    <!-- <SettingsSearch
        bind:value={searchText}
        {resultCount}
        onClear={clearSearch}
    /> -->

    <Tabs.Root bind:value={tab} class="w-full">
        <Tabs.List class="grid w-full grid-cols-3">
            {#each tabOrder as tabName}
                <Tabs.Trigger value={tabName}>{tabLabels[tabName]}</Tabs.Trigger>
            {/each}
        </Tabs.List>

        {#each tabOrder as tabName}
            <Tabs.Content value={tabName} class="space-y-6">
                {#if searchMode && resultCount === 0}
                    <Empty.Root>
                        <Empty.Title>{'未找到匹配的设置项'}</Empty.Title>
                        <Empty.Description>{'换一个关键词再试。'}</Empty.Description>
                    </Empty.Root>
                {:else}
                    {#each getTabGroups(tabName) as group (group.id)}
                        <SettingsGroup
                            {group}
                            entries={getTabEntries(tabName).filter(
                                (entry) => entry.group === group.id
                            )}
                            settingsStore={userSettings}
                            settings={$userSettings}
                            {searchMode}
                            {highlightedIds}
                        />
                    {/each}
                {/if}
            </Tabs.Content>
        {/each}
    </Tabs.Root>
</div>
