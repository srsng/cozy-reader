<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Type } from 'lucide-svelte';
    import { COMMAND_ROUTER } from '$lib/commands';
    import { executeReaderCommand, ReaderCommandId } from '$lib/reader/commands';
    import { readerCommandState } from '$lib/reader/stores/readerCommandState';
    import { inject } from '$lib/utils/context';

    interface Props {
        bookKey: string;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }

    let { bookKey, open = $bindable(false), onOpenChange }: Props = $props();
    const commandRouter = inject(COMMAND_ROUTER);

    $effect(() => {
        const unsubscribe = readerCommandState.subscribe(() => {
            const nextOpen = readerCommandState.isSettingsOpen(bookKey);
            if (open === nextOpen) return;

            open = nextOpen;
            onOpenChange?.(nextOpen);
        });

        return unsubscribe;
    });

    const handleToggleSettings = async () => {
        const currentOpen = readerCommandState.isSettingsOpen(bookKey);
        const executed = await executeReaderCommand(
            commandRouter,
            currentOpen ? ReaderCommandId.SettingsClose : ReaderCommandId.SettingsOpen,
            { bookKey }
        );
        if (!executed) return;
    };
</script>

<Button variant="ghost" size="icon" onclick={handleToggleSettings} title="阅读器设置">
    <Type class="h-4 w-4" />
</Button>
