<script lang="ts">
    import { DialogContent, DialogClose } from '$lib/components/ui/dialog';
    import { CommandAwareDialogRoot } from '$lib/components/overlays';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
    import { Type, LayoutDashboard, Palette, Hand, Languages, Settings } from 'lucide-svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import FontPanel from './FontPanel.svelte';
    import LayoutPanel from './LayoutPanel.svelte';
    import ColorPanel from './ColorPanel.svelte';
    import ControlPanel from './ControlPanel.svelte';
    import CustomPanel from './CustomPanel.svelte';
    import Label from '$components/ui/label/label.svelte';
    import { Button } from '$components/ui/button';
    import { readerCommandState } from '$lib/reader/stores/readerCommandState';
    import { COMMAND_ROUTER } from '$lib/commands';
    import { executeReaderCommand, ReaderCommandId } from '$lib/reader/commands';
    import { inject } from '$lib/utils/context';

    interface Props {
        bookKey: string;
    }

    const { bookKey }: Props = $props();

    type SettingsPanelType = 'Font' | 'Layout' | 'Color' | 'Control' | 'Language' | 'Custom';
    let activePanel = $state<SettingsPanelType>('Font');
    let open = $state(readerCommandState.isSettingsOpen(bookKey));
    const commandRouter = inject(COMMAND_ROUTER);

    $effect(() => {
        const unsubscribe = readerCommandState.subscribe(() => {
            open = readerCommandState.isSettingsOpen(bookKey);
        });

        return unsubscribe;
    });

    // 监听 open 变化，确保对话框正确打开
    $effect(() => {
        if (open) {
            // 对话框打开时，确保焦点正确
            setTimeout(() => {
                const dialog = document.querySelector('[role="dialog"]');
                if (dialog) {
                    (dialog as HTMLElement).focus();
                }
            }, 100);
        }
    });

    async function closeWithCommand() {
        const executed = await executeReaderCommand(commandRouter, ReaderCommandId.SettingsClose, {
            bookKey
        });
        if (!executed) return;

        open = false;
        readerStore.setHoveredBookKey(null);
    }

    const handleClose = () => {
        void closeWithCommand();
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            open = true;
            return;
        }

        if (readerCommandState.isSettingsOpen(bookKey)) {
            void closeWithCommand();
            return;
        }

        open = false;
    };

    const tabConfig = [
        { tab: 'Font' as SettingsPanelType, icon: Type, label: '字体', Panel: FontPanel },
        {
            tab: 'Layout' as SettingsPanelType,
            icon: LayoutDashboard,
            label: '布局',
            Panel: LayoutPanel
        },
        { tab: 'Color' as SettingsPanelType, icon: Palette, label: '颜色', Panel: ColorPanel },
        { tab: 'Control' as SettingsPanelType, icon: Hand, label: '行为', Panel: ControlPanel },
        { tab: 'Custom' as SettingsPanelType, icon: Settings, label: '自定义', Panel: CustomPanel }
    ];
</script>

<CommandAwareDialogRoot {open} onOpenChange={handleOpenChange}>
    <DialogContent
        showCloseButton={false}
        class="flex h-[80vh] w-[100vh] flex-col border-0 bg-transparent p-0 shadow-none"
    >
        <!-- <DialogHeader class="flex-shrink-0 px-6 pb-4 pt-6">
            <DialogTitle>设置</DialogTitle>
        </DialogHeader> -->
        <Tabs
            value={activePanel}
            onValueChange={(v) => (activePanel = v as SettingsPanelType)}
            class="flex min-h-0 flex-1 flex-col"
        >
            <TabsList class="grid h-fit w-full flex-shrink-0 grid-cols-5">
                {#each tabConfig as { tab, icon: Icon, label }}
                    <TabsTrigger value={tab} class="flex flex-col gap-1">
                        <Icon class="h-4 w-4" />
                        <Label>{label}</Label>
                    </TabsTrigger>
                {/each}
            </TabsList>
            {#each tabConfig as { tab, Panel }}
                <TabsContent value={tab} class="mt-0 min-h-0 flex-1 ">
                    <Panel />
                </TabsContent>
            {/each}
        </Tabs>
        <DialogClose class="flex flex-shrink-0 justify-center pb-4 pt-2">
            <Button onclick={handleClose}>Done</Button>
        </DialogClose>
    </DialogContent>
</CommandAwareDialogRoot>
