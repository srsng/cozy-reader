<script lang="ts">
	const {
		text,
		raw
	}: {
		text: string;
		raw: string;
	} = $props();
</script>

<!-- <p class="leading-7 [&:not(:first-child)]:mt-6">{text}</p> -->

{#if raw.startsWith('## ')}
	<h2
		class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
	>
		{text}
	</h2>
{:else if raw.startsWith('### ')}
	<h3 class="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
		{text}
	</h3>
{:else if raw.startsWith('### ')}
	<h4 class="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">
		{text}
	</h4>
{:else if raw.startsWith('##### ')}
	<h5 class="mt-8 scroll-m-20 text-lg font-semibold tracking-tight">
		{text}
	</h5>
{:else if raw.startsWith('###### ')}
	<h6 class="mt-8 scroll-m-20 text-base font-semibold tracking-tight">
		{text}
	</h6>
{:else if raw.startsWith('# ')}
	<h1 class="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight">
		{text}
	</h1>
{/if}
