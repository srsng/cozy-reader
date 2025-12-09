<script lang="ts">
    import type { Book } from '@cozy-reader/database';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import { sidebarStore } from '$lib/reader/stores/sidebarStore';
    import { Button } from '$ui/button';
    import { Menu, X } from '@lucide/svelte';
    import SettingsToggler from './settings/SettingsToggler.svelte';

    interface Props {
        bookKey: string;
        book: Book;
        isVisible: boolean;
    }

    const { bookKey, book, isVisible }: Props = $props();

    let hovered = $state(false);
    let settingsOpen = $state(false);

    const handleToggleSidebar = () => {
        sidebarStore.toggle();
    };

    const handleClose = async () => {
        const { goReaderHome } = await import('$lib/utils/route.svelte');
        goReaderHome();
    };
</script>

{#if isVisible || hovered}
    <header
        aria-label="阅读器顶部栏"
        class="bg-card flex h-11 flex-shrink-0 items-center justify-between px-4"
        onpointerenter={() => (hovered = true)}
        onpointerleave={() => (hovered = false)}
    >
        <div class="flex items-center gap-2">
            <Button variant="ghost" size="sm" onclick={handleToggleSidebar} aria-label="切换侧边栏">
                <Menu class="h-5 w-5" />
            </Button>
            <h1 class="line-clamp-1 text-sm font-semibold">{book.title}</h1>
        </div>
        <div class="flex items-center gap-2">
            <SettingsToggler {bookKey} bind:open={settingsOpen} />
            <Button variant="ghost" size="sm" onclick={handleClose} aria-label="关闭">
                <X class="h-5 w-5" />
            </Button>
        </div>
    </header>
{/if}
