<script lang="ts">
	import { slugify } from '$lib/utils/string';

	interface Props {
		depth: number;
		raw: string;
		text: string;
	}

	const { depth, raw, text }: Props = $props();

	const id = $derived(slugify(text) ?? text);
</script>

{#if depth === 2}
	<h2
		{id}
		class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
	>
		{text}
	</h2>
{:else if depth === 3}
	<h3 {id} class="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
		{text}
	</h3>
{:else if depth === 4}
	<h4 {id} class="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">
		{text}
	</h4>
{:else if depth === 5}
	<h5 class="mt-8 scroll-m-20 text-lg font-semibold tracking-tight">
		{text}
	</h5>
{:else if depth === 6}
	<h6 {id} class="mt-8 scroll-m-20 text-base font-semibold tracking-tight">
		{text}
	</h6>
{:else if depth === 1}
	<h1 {id} class="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight">
		{text}
	</h1>
{:else}
	{raw}
{/if}
