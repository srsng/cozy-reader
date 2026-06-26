<script lang="ts" module>
    import MarkdownContent from './MarkdownContent.svelte';
    import { lexMarkdown } from './math';
    import { serializeMarkdownCopyFragment } from './markdown-copy';

    interface Props {
        filePath: string;
        content: string | undefined;
    }

    function handleCopy(event: ClipboardEvent) {
        const selection = document.getSelection();

        if (
            !selection ||
            selection.isCollapsed ||
            selection.rangeCount === 0 ||
            !event.clipboardData
        ) {
            return;
        }

        let hasMarkdownCopyText = false;
        const copiedText: string[] = [];

        for (let index = 0; index < selection.rangeCount; index += 1) {
            const range = selection.getRangeAt(index);
            const serialized = serializeMarkdownCopyFragment(range.cloneContents());

            if (serialized === null) {
                copiedText.push(range.toString());
                continue;
            }

            hasMarkdownCopyText = true;
            copiedText.push(serialized);
        }

        if (!hasMarkdownCopyText) {
            return;
        }

        event.clipboardData.setData('text/plain', copiedText.join('\n'));
        event.preventDefault();
    }
</script>

<script lang="ts">
    const { content, filePath }: Props = $props();

    const tokens = $derived(lexMarkdown(content ?? ''));
</script>

<div class="markdown" oncopy={handleCopy}>
    {#if tokens}
        <MarkdownContent type="init" {tokens} mdSrcPath={filePath} />
    {/if}
</div>
