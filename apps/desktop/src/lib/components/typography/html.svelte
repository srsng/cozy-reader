<script lang="ts">
    interface Props {
        raw: string;
    }

    const { raw }: Props = $props();

    let showSource = $state(false);

    const toggleLabel = $derived(showSource ? '查看预览' : '查看源码');
    const toggleAriaLabel = $derived(showSource ? '切换到 HTML 预览视图' : '切换到 HTML 源码视图');

    function toggleSource() {
        showSource = !showSource;
    }
</script>

<figure
    data-html-block="true"
    class="border-border bg-muted/20 my-4 overflow-hidden rounded-md border"
>
    <figcaption
        class="text-muted-foreground bg-muted/40 flex items-center justify-between gap-3 border-b px-3 py-1.5 text-xs font-medium"
    >
        <span class="select-none font-mono uppercase">HTML</span>
        <button
            type="button"
            aria-pressed={showSource}
            aria-label={toggleAriaLabel}
            class="hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 select-none rounded-md px-2 py-1 outline-none transition-colors focus-visible:ring-2"
            onclick={toggleSource}
        >
            {toggleLabel}
        </button>
    </figcaption>
    {#if showSource}
        <pre class="max-h-[32rem] overflow-auto p-3 text-sm leading-relaxed"><code>{raw}</code
            ></pre>
    {:else}
        <div class="py-3">
            {@html raw}
        </div>
    {/if}
</figure>
