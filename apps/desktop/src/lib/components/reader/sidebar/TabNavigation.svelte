<script lang="ts">
    import type { SidebarTab } from '$lib/reader/stores/sidebarStore';
    import { Tabs, TabsList, TabsTrigger } from '$ui/tabs';
    import { List, Search, SquarePen } from '@lucide/svelte';

    interface Props {
        currentTab: SidebarTab;
        onTabChange: (tab: SidebarTab) => void;
    }

    const { currentTab, onTabChange }: Props = $props();
</script>

<Tabs value={currentTab} onValueChange={(value) => onTabChange(value as SidebarTab)}>
    <TabsList class="h-auto gap-1 bg-transparent p-0">
        <TabsTrigger value="toc" class="flex items-center gap-1.5" title="目录" aria-label="目录">
            <List class="h-4 w-4" />
            <span class="sr-only">目录</span>
        </TabsTrigger>
        <TabsTrigger
            value="search"
            class="flex items-center gap-1.5"
            title="搜索"
            aria-label="搜索"
        >
            <Search class="h-4 w-4" />
            <span class="sr-only">搜索</span>
        </TabsTrigger>
        <TabsTrigger value="notes" class="flex items-center gap-1.5" title="笔记" aria-label="笔记">
            <SquarePen class="h-4 w-4" />
            <span class="sr-only">笔记</span>
        </TabsTrigger>
    </TabsList>
</Tabs>
