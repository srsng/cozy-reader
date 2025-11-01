<script lang="ts" module>
    import type { Snippet } from 'svelte';

    interface Props {
        text: string;
        raw: boolean;
        children: Snippet;
    }
</script>

<script lang="ts">
    const { text, raw, children }: Props = $props();
</script>

<blockquote class="border-primary bg-primary/10 rounded-r-lg border-l-4 border-solid px-4 py-2">
    {@render children()}
</blockquote>
