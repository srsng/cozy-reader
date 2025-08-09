<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { goHome } from '$lib/utils/route.svelte';

	// todo 实现goback替换gohome
	const { children }: { children: Snippet } = $props();
</script>

<div class="mx-auto w-full max-w-[85%] select-none space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div class="space-y-2">
			<h2 class="text-2xl font-bold">设置</h2>
			<p class="text-muted-foreground">管理应用程序的设置选项</p>
		</div>

		<Button onclick={goHome}><X /></Button>
	</div>
	{@render children?.()}
</div>
