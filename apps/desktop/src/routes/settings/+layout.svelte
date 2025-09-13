<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { UtilButton } from '$lib/components/layout/util-btn';
	import { fade, slide } from 'svelte/transition';

	const { children, data }: { children: Snippet; data: LayoutData } = $props();
	const metaData = data.metaData;
</script>

<div class="mx-auto w-full max-w-[80%] select-none space-y-6 p-6" out:slide in:fade>
	<div class="flex items-center justify-between">
		<div class="space-y-2">
			<h2 class="text-2xl font-bold">{metaData.title}</h2>
			<p class="text-muted-foreground">{metaData.description}</p>
		</div>

		<div class="flex items-center gap-2">
			<UtilButton.back className="size-9" size="icon" variant="default" />
			<UtilButton.home className="size-9" size="icon" variant="outline" />
		</div>
	</div>
	{@render children?.()}
</div>
