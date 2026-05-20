<script lang="ts" module>
    import type { TitleBarItemConfig } from '$lib/settings/Layout';
    import { cn } from '$lib/utils';
    import { Button } from '$ui/button';
    import { MENU_SERVICE } from '$lib/menus';
    import { inject } from '$lib/utils/context';
    import { getTitleBarContribution } from './titlebarContributions';
    import { getTitleBarIcon } from './titlebarIcons';
    import { titleBarButtonClass, titleBarTextButtonClass } from './titlebarLayout';
    import { onDestroy } from 'svelte';
</script>

<script lang="ts">
    const menuService = inject(MENU_SERVICE);

    const {
        appTitle,
        config,
        className = titleBarButtonClass,
        textClassName = titleBarTextButtonClass,
        btnDisabled = false,
        iconClass = 'size-4',
        variant = 'bar-no-bg' as const,
        mode = 'runtime',
        editing = false,
        selected = false,
        onSelect
    }: {
        appTitle: string;
        config: TitleBarItemConfig;
        className?: string;
        textClassName?: string;
        btnDisabled?: boolean;
        iconClass?: string;
        variant?: 'bar' | 'bar-no-bg';
        mode?: 'runtime' | 'preview';
        editing?: boolean;
        selected?: boolean;
        onSelect?: (item: TitleBarItemConfig) => void;
    } = $props();

    let menuChangeVersion = $state(0);
    let buttonElement: HTMLButtonElement | null = $state(null);
    const disposable = menuService.onDidChange(() => {
        menuChangeVersion += 1;
    });

    onDestroy(() => {
        disposable.dispose();
    });

    const contribution = $derived.by(() => {
        menuChangeVersion;
        return getTitleBarContribution(config.contributionId, menuService);
    });

    const menuContribution = $derived(contribution?.menuContribution);
    const title = $derived.by(() => {
        menuChangeVersion;
        if (config.titleOverride?.trim()) return config.titleOverride.trim();
        if (!menuContribution) return contribution?.title ?? config.contributionId;
        return menuService.getDisplayTitle(menuContribution);
    });
    const disabled = $derived.by(() => {
        menuChangeVersion;
        return (
            btnDisabled || (menuContribution ? !menuService.canExecute(menuContribution) : false)
        );
    });
    const isPreview = $derived(mode === 'preview');
    const hidden = $derived(!isPreview && Boolean(contribution?.hideWhenDisabled && disabled));
    const shouldRender = $derived(
        Boolean(contribution && (isPreview || config.enabled) && !hidden)
    );
    const ComponentButton = $derived(contribution?.component);
    const Icon = $derived(getTitleBarIcon(config.iconId) ?? contribution?.icon);
    const selectableStateClass = $derived(
        cn(
            !config.enabled && 'opacity-40',
            editing ? 'cursor-pointer' : 'cursor-default',
            selected && 'outline-primary bg-primary/10 outline-2 outline-offset-0',
            editing && !selected && 'hover:bg-accent-foreground/20'
        )
    );

    async function execute() {
        if (!menuContribution || disabled) return;
        await menuService.execute(menuContribution);
    }

    function select() {
        if (!editing) return;
        onSelect?.(config);
    }
</script>

{#if shouldRender}
    {#if isPreview}
        {#if contribution?.text}
            <button
                data-slot="button"
                type="button"
                {title}
                class={cn(textClassName, selectableStateClass)}
                tabindex={editing ? 0 : -1}
                aria-disabled={!editing}
                aria-pressed={selected}
                onclick={select}
            >
                {appTitle || title}
            </button>
        {:else}
            <Button
                id={config.id}
                {title}
                {variant}
                size="icon"
                class={cn(
                    contribution?.destructive &&
                        'hover:bg-destructive hover:text-destructive-foreground',
                    className,
                    selectableStateClass
                )}
                tabindex={editing ? 0 : -1}
                aria-disabled={!editing}
                aria-pressed={selected}
                onclick={select}
            >
                {#if Icon}
                    <Icon class={iconClass} />
                {:else}
                    <span class="text-xs">{title.slice(0, 1)}</span>
                {/if}
            </Button>
        {/if}
    {:else if contribution?.kind === 'component' && ComponentButton}
        <ComponentButton
            name={config.id}
            {appTitle}
            className={cn(contribution.text ? textClassName : className)}
            {iconClass}
            disabled={btnDisabled}
            {variant}
        />
    {:else if contribution?.kind === 'menu'}
        <Button
            bind:ref={buttonElement}
            id={config.id}
            {title}
            {variant}
            size="icon"
            class={cn(
                contribution.destructive &&
                    'hover:bg-destructive hover:text-destructive-foreground',
                className
            )}
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
