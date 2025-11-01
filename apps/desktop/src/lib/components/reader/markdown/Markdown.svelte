<script lang="ts" module>
    import MarkdownContent from './MarkdownContent.svelte';
    import { Lexer } from 'marked';
    interface Props {
        content: string | undefined;
    }
</script>

<script lang="ts">
    const options = {
        async: false,
        breaks: true,
        gfm: true,
        pedantic: false,
        renderer: null,
        silent: false,
        tokenizer: null,
        walkTokens: null
    };

    const { content }: Props = $props();

    const tokens = $derived.by(() => {
        const lexer = new Lexer(options);
        return lexer.lex(content ?? '');
    });
</script>

<div class="markdown">
    {#if tokens}
        <MarkdownContent type="init" {tokens} />
    {/if}
</div>
