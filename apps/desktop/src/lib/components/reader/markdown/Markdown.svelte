<script lang="ts" module>
    import MarkdownContent from './MarkdownContent.svelte';
    import { lexMarkdown } from './math';

    interface Props {
        content: string | undefined;
    }
</script>

<script lang="ts">
    const { content }: Props = $props();

    const tokens = $derived(lexMarkdown(content ?? ''));
</script>

<div class="markdown">
    {#if tokens}
        <MarkdownContent type="init" {tokens} />
    {/if}
</div>
