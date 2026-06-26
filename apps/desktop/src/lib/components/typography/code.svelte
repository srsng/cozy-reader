<script lang="ts">
    import CopyIcon from '@lucide/svelte/icons/copy';
    import { writeToClipBoard } from '$lib/utils/clip';

    interface Props {
        text: string;
        lang?: string;
    }

    const { text, lang = '' }: Props = $props();

    const normalizedLang = $derived(lang.trim());
    const languageLabel = $derived(normalizedLang || '纯文本');
    const languageClass = $derived(normalizedLang ? `language-${normalizedLang}` : undefined);
    const lineNumbers = $derived(
        Array.from({ length: Math.max(1, text.split('\n').length) }, (_, index) => index + 1)
    );

    function handleCopy() {
        void writeToClipBoard(text, true);
    }
</script>

<figure class="border-border bg-muted/30 my-4 overflow-hidden rounded-md border">
    <figcaption
        class="text-muted-foreground bg-muted/50 flex items-center justify-between gap-3 border-b px-3 py-1.5 text-xs"
    >
        <span class="min-w-0 select-none">
            <span>代码块</span>
            <span class="font-mono"> · {languageLabel}</span>
        </span>
        <button
            type="button"
            aria-label="复制代码"
            data-code-copy-button="true"
            class="hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-7 shrink-0 select-none items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2"
            onclick={handleCopy}
        >
            <CopyIcon aria-hidden="true" class="size-3.5" />
        </button>
    </figcaption>
    <div class="grid grid-cols-[auto_minmax(0,1fr)] overflow-x-auto text-[0.95em] leading-relaxed">
        <div
            aria-hidden="true"
            class="text-muted-foreground/70 border-border bg-muted/20 select-none border-r px-3 py-4 text-right font-mono"
        >
            {#each lineNumbers as lineNumber}
                <span data-code-line-number="true" class="block">{lineNumber}</span>
            {/each}
        </div>
        <pre class="min-w-0 overflow-x-auto p-4"><code class={languageClass}>{text}</code></pre>
    </div>
</figure>
