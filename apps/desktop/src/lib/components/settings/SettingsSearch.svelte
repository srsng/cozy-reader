<script lang="ts">
    import { Button } from '$ui/button';
    import { Input } from '$ui/input';
    import { Search, X } from 'lucide-svelte';

    let {
        value = $bindable(''),
        resultCount = 0,
        onClear
    }: {
        value?: string;
        resultCount?: number;
        onClear?: () => void;
    } = $props();

    function clearSearch() {
        value = '';
        onClear?.();
    }
</script>

<div class="space-y-2">
    <div class="relative">
        <Search class="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
        <Input
            bind:value
            class="px-8"
            placeholder="搜索设置"
            aria-label="搜索设置"
            onkeydown={(event) => {
                if (event.key === 'Escape') clearSearch();
            }}
        />
        {#if value}
            <Button
                class="absolute right-0 top-0"
                variant="ghost"
                size="icon"
                aria-label="清除搜索"
                onclick={clearSearch}
            >
                <X />
            </Button>
        {/if}
    </div>
    <div class="text-muted-foreground text-sm" aria-live="polite">
        {#if value.trim()}
            找到 {resultCount} 个匹配项
        {:else}
            输入关键词搜索设置项
        {/if}
    </div>
</div>
