<script lang="ts">
	import type { Snippet } from 'svelte';
	import { UtilButton } from '$lib/components/layout/util-btn';

	const { children }: { children: Snippet } = $props();
</script>

<div class="mx-auto w-full max-w-[85%] select-none space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div class="space-y-2">
			<h2 class="text-2xl font-bold">设置</h2>
			<p class="text-muted-foreground">管理应用程序的设置选项</p>
		</div>

		<div class="flex items-center gap-2">
			<UtilButton.back className="size-9" size="icon" variant="default" />
			<UtilButton.home className="size-9" size="icon" variant="outline" />
		</div>
	</div>
	{@render children?.()}
</div>
