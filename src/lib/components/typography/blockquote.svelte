<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		raw: boolean;
		children: Snippet;
	}

	const { text, raw, children }: Props = $props();
	console.log('bq text', raw, text);
</script>

<blockquote class="border-primary bg-primary/10 rounded-r-lg border-l-4 border-solid px-4 py-2">
	{@render children()}
</blockquote>
