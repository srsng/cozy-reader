<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Search, NotebookPen, Pin, PinOff, ChevronLeft } from 'lucide-svelte';

    interface Props {
        isPinned: boolean;
        isSearchBarVisible: boolean;
        onClose: () => void;
        onTogglePin: () => void;
        onToggleSearchBar: () => void;
    }

    const { isPinned, isSearchBarVisible, onClose, onTogglePin, onToggleSearchBar }: Props =
        $props();
</script>

<div class="notebook-header relative flex h-11 items-center px-3" dir="ltr">
    <div class="absolute inset-0 z-[-1] flex items-center justify-center gap-2">
        <NotebookPen class="h-4 w-4" />
        <div class="notebook-title hidden text-sm font-medium sm:flex">笔记本</div>
    </div>
    <div class="flex w-full items-center gap-x-4">
        <Button
            variant="ghost"
            size="icon"
            class="hidden h-6 w-6 sm:flex {isPinned ? 'bg-base-300' : 'bg-base-300/65'}"
            onclick={onTogglePin}
            title={isPinned ? '取消固定笔记本' : '固定笔记本'}
        >
            {#if isPinned}
                <Pin class="h-3.5 w-3.5" />
            {:else}
                <PinOff class="h-3.5 w-3.5" />
            {/if}
        </Button>
        <Button
            variant="ghost"
            size="icon"
            class="flex h-6 w-6 hover:bg-transparent sm:hidden"
            onclick={onClose}
            title="关闭"
        >
            <ChevronLeft class="h-5 w-5" />
        </Button>
    </div>
    <div class="flex items-center justify-end gap-x-4">
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 p-0 {isSearchBarVisible ? 'bg-base-300' : ''}"
            onclick={onToggleSearchBar}
            title={isSearchBarVisible ? '隐藏搜索栏' : '显示搜索栏'}
        >
            <Search class="h-4 w-4" />
        </Button>
    </div>
</div>
