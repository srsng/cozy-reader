<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import type { ComponentProps } from 'svelte';

    interface Props {
        showTooltip: boolean;
        tooltipText: string;
        disabled?: boolean;
        Icon: typeof import('lucide-svelte').Icon;
        onClick: () => void;
    }

    const { showTooltip, tooltipText, disabled, Icon, onClick }: Props = $props();

    let buttonClicked = $state(false);

    const handleClick = () => {
        buttonClicked = true;
        onClick();
    };
</script>

<div class="group relative" title={!buttonClicked && showTooltip ? tooltipText : undefined}>
    <Button variant="ghost" size="icon" class="h-8 w-8" {disabled} onclick={handleClick}>
        <Icon class="h-4 w-4" />
    </Button>
    {#if !buttonClicked && showTooltip}
        <div
            class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
            {tooltipText}
        </div>
    {/if}
</div>
