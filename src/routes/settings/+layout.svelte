<script lang="ts">
	import type { Snippet } from 'svelte';
	import { UtilButton } from '$lib/components/layout/util-btn';
	import { page } from '$app/state';
	import { fade, slide } from 'svelte/transition';

	const { children }: { children: Snippet } = $props();

	const metaData = {
		title: '设置',
		description: '管理应用程序的设置选项'
	};
</script>

<svelte:head>
	<title>{metaData.title}</title>
	<meta name="description" content={metaData.description} />
</svelte:head>

<div class="mx-auto w-full max-w-[80%] select-none space-y-6 p-6" out:slide in:fade>
	<div class="flex items-center justify-between">
		<div class="space-y-2">
			<h2 class="text-2xl font-bold">{page.data.title ?? metaData.title}</h2>
			<p class="text-muted-foreground">{page.data.description ?? metaData.description}</p>
		</div>

		<div class="flex items-center gap-2">
			<UtilButton.back className="size-9" size="icon" variant="default" />
			<UtilButton.home className="size-9" size="icon" variant="outline" />
		</div>
	</div>
	{@render children?.()}
</div>
