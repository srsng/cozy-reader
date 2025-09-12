<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<span class="leading-7 [&:not(:first-child)]:mt-6">
	{@render children()}
</span>
