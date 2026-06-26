<script lang="ts">
    import * as Command from '$ui/command';
    import { Check } from 'lucide-svelte';
    import { MENU_SERVICE, MenuId, type MenuContribution } from '$lib/menus';
    import { CONTEXT_KEY_SERVICE } from '$lib/context-keys';
    import { keybindingManager } from '$lib/keybindings/keybindingManager';
    import { KeybindingUtils } from '$lib/keybindings/keybindingListener';
    import { inject } from '$lib/utils/context';
    import { ScrollArea } from '$components/ui/scroll-area';
    import { toast } from 'svelte-sonner';
    import { APP_STATE, setAppCommandPaletteOpen } from '$lib/stores/appState';
    import { createDeferredInvalidation } from '$lib/utils/deferredInvalidation';

    const menuService = inject(MENU_SERVICE);
    const contextKeys = inject(CONTEXT_KEY_SERVICE);
    const appState = inject(APP_STATE);

    let value = $state('');
    let version = $state(0);
    const invalidate = createDeferredInvalidation(() => {
        version += 1;
    });

    const commands = $derived.by(() => {
        version;
        return menuService.getVisibleItems(MenuId.CommandPalette);
    });

    const groupedCommands = $derived.by(() => {
        const groups = new Map<MenuContribution['category'], MenuContribution[]>();

        for (const command of commands) {
            const group = groups.get(command.category) ?? [];
            group.push(command);
            groups.set(command.category, group);
        }

        return Array.from(groups.entries());
    });

    $effect(() => {
        const contextDisposable = contextKeys.onDidChange((snapshot) => {
            snapshot;
            invalidate.schedule();
        });
        const menuDisposable = menuService.onDidChange(() => {
            invalidate.schedule();
        });

        return () => {
            contextDisposable();
            menuDisposable.dispose();
            invalidate.dispose();
        };
    });

    $effect(() => {
        if (!$appState.ui.commandPaletteOpen) value = '';
    });

    function setCommandPaletteOpen(open: boolean): void {
        setAppCommandPaletteOpen(appState, open);
    }

    async function execute(command: MenuContribution) {
        if (!menuService.canExecute(command)) return;

        try {
            const executed = await menuService.execute(command);
            if (executed && !command.keepOpen) {
                setCommandPaletteOpen(false);
            }
        } catch (error) {
            console.error(`Failed to execute menu contribution ${command.id}:`, error);
            toast.error('命令执行失败', {
                description: error instanceof Error ? error.message : String(error)
            });
        }
    }

    function shortcutFor(command: MenuContribution): string {
        const keybinding = keybindingManager.getKeybindingsForInvocation(command.invocation)[0];
        if (!keybinding) return command.defaultShortcut ?? '';
        return KeybindingUtils.combinationToString(keybinding.combination);
    }

    function categoryLabel(category: MenuContribution['category']) {
        const labels: Record<MenuContribution['category'], string> = {
            application: '应用',
            navigation: '导航',
            reader: '阅读',
            theme: '主题',
            window: '窗口',
            zoom: '缩放'
        };

        return labels[category];
    }
</script>

<Command.Dialog
    bind:open={() => $appState.ui.commandPaletteOpen, setCommandPaletteOpen}
    bind:value
    title="命令面板"
    description="搜索并执行命令"
    class="max-w-xl"
    id="command-palette"
>
    <Command.Input placeholder="搜索命令..." />
    <Command.List>
        <!-- todo: Command.List 的 no-scrollbar 无效 -->
        <ScrollArea class="h-full w-full">
            <Command.Empty>{'没有找到命令'}</Command.Empty>
            {#each groupedCommands as [category, categoryCommands] (category)}
                <Command.Group heading={categoryLabel(category)}>
                    {#each categoryCommands as command (command.id)}
                        <Command.Item
                            value={[
                                menuService.getDisplayTitle(command),
                                menuService.getDisplayDescription(command),
                                ...(command.keywords ?? [])
                            ].join(' ')}
                            disabled={!menuService.canExecute(command)}
                            onclick={() => execute(command)}
                            onkeydown={(event) => {
                                if (event.key === 'Enter') execute(command);
                            }}
                        >
                            {#if command.toggled}
                                <Check
                                    class="size-4 shrink-0 {menuService.isToggled(command)
                                        ? 'opacity-100'
                                        : 'opacity-0'}"
                                />
                            {/if}
                            <div class="flex min-w-0 flex-col">
                                <span class="truncate">{menuService.getDisplayTitle(command)}</span>
                                {#if menuService.getDisplayDescription(command)}
                                    <span class="text-muted-foreground truncate text-xs">
                                        {menuService.getDisplayDescription(command)}
                                    </span>
                                {/if}
                            </div>
                            {#if shortcutFor(command)}
                                <Command.Shortcut>{shortcutFor(command)}</Command.Shortcut>
                            {/if}
                        </Command.Item>
                    {/each}
                </Command.Group>
            {/each}
        </ScrollArea>
    </Command.List>
</Command.Dialog>
