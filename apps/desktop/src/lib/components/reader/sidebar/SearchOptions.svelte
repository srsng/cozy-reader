<script lang="ts">
    import type { BookSearchConfig } from '$lib/reader/types';
    import * as DropdownMenu from '$ui/dropdown-menu';
    import { Check } from '@lucide/svelte';

    interface Props {
        searchConfig: BookSearchConfig;
        onSearchConfigChanged: (config: BookSearchConfig) => void;
    }

    const { searchConfig, onSearchConfigChanged }: Props = $props();

    const updateConfig = (key: keyof BookSearchConfig, value: boolean | string) => {
        onSearchConfigChanged({ ...searchConfig, [key]: value });
    };
</script>

<DropdownMenu.Content class="w-56">
    <DropdownMenu.Item
        onclick={() => updateConfig('scope', 'book')}
        class="flex items-center justify-between"
    >
        <span>整本书</span>
        {#if searchConfig.scope === 'book'}
            <Check class="h-4 w-4" />
        {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Item
        onclick={() => updateConfig('scope', 'section')}
        class="flex items-center justify-between"
    >
        <span>当前章节</span>
        {#if searchConfig.scope === 'section'}
            <Check class="h-4 w-4" />
        {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
        onclick={() => updateConfig('matchCase', !searchConfig.matchCase)}
        class="flex items-center justify-between"
    >
        <span>区分大小写</span>
        {#if searchConfig.matchCase}
            <Check class="h-4 w-4" />
        {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Item
        onclick={() => updateConfig('matchWholeWords', !searchConfig.matchWholeWords)}
        class="flex items-center justify-between"
    >
        <span>全字匹配</span>
        {#if searchConfig.matchWholeWords}
            <Check class="h-4 w-4" />
        {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Item
        onclick={() => updateConfig('matchDiacritics', !searchConfig.matchDiacritics)}
        class="flex items-center justify-between"
    >
        <span>匹配变音符号</span>
        {#if searchConfig.matchDiacritics}
            <Check class="h-4 w-4" />
        {/if}
    </DropdownMenu.Item>
</DropdownMenu.Content>
