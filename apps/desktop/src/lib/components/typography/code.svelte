<script lang="ts">
    interface Props {
        text: string;
        lang?: string;
    }

    const { text, lang = '' }: Props = $props();

    const languageClass = $derived(lang ? `language-${lang}` : undefined);
</script>

<pre><code class={languageClass}>{text}</code></pre>
