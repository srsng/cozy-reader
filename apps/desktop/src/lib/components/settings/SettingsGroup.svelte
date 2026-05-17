<script lang="ts">
    import * as Card from '$ui/card';
    import type { UserSettings } from '$lib/settings';
    import type { SettingGroup, SettingViewModel } from '$lib/settings-registry';
    import SettingItemRenderer from './SettingItemRenderer.svelte';
    import type { Writable } from 'svelte/store';

    let {
        group,
        entries,
        settingsStore,
        settings,
        searchMode = false,
        highlightedIds = new Set<string>()
    }: {
        group: SettingGroup;
        entries: SettingViewModel[];
        settingsStore: Writable<UserSettings>;
        settings: UserSettings;
        searchMode?: boolean;
        highlightedIds?: Set<string>;
    } = $props();

    const compactSingleItem = $derived(!searchMode && entries.length === 1);
</script>

{#if compactSingleItem}
    <Card.Root size="sm">
        <Card.Content class="px-0">
            <SettingItemRenderer
                entry={entries[0]}
                {settingsStore}
                {settings}
                {searchMode}
                highlighted={highlightedIds.has(entries[0].id)}
            />
        </Card.Content>
    </Card.Root>
{:else}
    <Card.Root>
        <Card.Header>
            <Card.Title>{group.label}</Card.Title>
            {#if group.description}
                <Card.Description>{group.description}</Card.Description>
            {/if}
        </Card.Header>
        <Card.Content class="space-y-2">
            {#each entries as entry (entry.id)}
                <SettingItemRenderer
                    {entry}
                    {settingsStore}
                    {settings}
                    {searchMode}
                    highlighted={highlightedIds.has(entry.id)}
                />
            {/each}
        </Card.Content>
    </Card.Root>
{/if}
