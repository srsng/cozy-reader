<script lang="ts">
    import { type Snippet } from 'svelte';

    interface Props {
        ordered: boolean;
        start: number | '';
        children: Snippet;
    }

    const { ordered, start, children }: Props = $props();
</script>

{#if ordered}
    <ol
        class="my-4 list-outside list-decimal pl-6 text-[1em] leading-[inherit]"
        start={Number(start)}
    >
        {@render children()}
    </ol>
{:else}
    <ul class="my-4 list-outside list-disc pl-6 text-[1em] leading-[inherit]">
        {@render children()}
    </ul>
{/if}
