<script lang="ts">
    import { type Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    const { children }: Props = $props();
</script>

<span class="font-extrabold">
    {@render children()}
</span>
