<script lang="ts" module>
    import type { TitleBarItemConfig } from '$lib/settings/Layout';
    import { cn } from '$lib/utils';
    import { Button } from '$ui/button';
    import { MENU_SERVICE } from '$lib/menus';
    import { inject } from '$lib/utils/context';
    import { getTitleBarContribution } from './titlebarContributions';
    import { onDestroy } from 'svelte';
</script>

<script lang="ts">
    const menuService = inject(MENU_SERVICE);

    const {
        appTitle,
        config,
        className = 'size-6',
        btnDisabled = false,
        iconClass = 'size-4',
        variant = 'bar-no-bg' as const
    }: {
        appTitle: string;
        config: TitleBarItemConfig;
        className?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        variant?: 'bar' | 'bar-no-bg';
    } = $props();

    let menuChangeVersion = $state(0);
    const disposable = menuService.onDidChange(() => {
        menuChangeVersion += 1;
    });

    onDestroy(() => disposable.dispose());

    const contribution = $derived.by(() => {
        menuChangeVersion;
        return getTitleBarContribution(config.contributionId, menuService);
    });

    const menuContribution = $derived(contribution?.menuContribution);
    const title = $derived.by(() => {
        menuChangeVersion;
        if (!menuContribution) return contribution?.title ?? config.contributionId;
        return menuService.getDisplayTitle(menuContribution);
    });
    const disabled = $derived.by(() => {
        menuChangeVersion;
        return btnDisabled || (menuContribution ? !menuService.canExecute(menuContribution) : false);
    });
    const hidden = $derived(Boolean(contribution?.hideWhenDisabled && disabled));
    const ComponentButton = $derived(contribution?.component);
    const Icon = $derived(contribution?.icon);

    async function execute() {
        if (!menuContribution || disabled) return;
        await menuService.execute(menuContribution);
    }
</script>

{#if config.enabled && contribution && !hidden}
    {#if contribution.kind === 'component' && ComponentButton}
        <ComponentButton
            name={config.id}
            {appTitle}
            className={cn(contribution.text ? 'app-title truncate' : className)}
            {iconClass}
            disabled={btnDisabled}
            {variant}
        />
    {:else if contribution.kind === 'menu'}
        <Button
            id={config.id}
            {title}
            {variant}
            size="icon"
            class={cn(contribution.destructive && 'hover:bg-destructive hover:text-destructive-foreground', className)}
            {disabled}
            onclick={execute}
        >
            {#if Icon}
                <Icon class={iconClass} />
            {:else}
                <span class="text-xs">{title.slice(0, 1)}</span>
            {/if}
        </Button>
    {/if}
{/if}
