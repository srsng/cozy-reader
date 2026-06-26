<script lang="ts">
    import { type Snippet } from 'svelte';

    interface Props {
        task?: boolean;
        checked?: boolean;
        children: Snippet;
    }

    const { task = false, checked = false, children }: Props = $props();
</script>

<li class={task ? 'flex items-start gap-2 [list-style:none]' : undefined}>
    {#if task}
        <input
            type="checkbox"
            {checked}
            disabled
            aria-label={checked ? '已完成任务' : '未完成任务'}
            class="border-input mt-1 size-4 shrink-0 rounded-[4px]"
        />
        <span class="min-w-0">
            {@render children()}
        </span>
    {:else}
        {@render children()}
    {/if}
</li>
