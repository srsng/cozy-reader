<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let {
		Map2Str,
		selected,
		onclick
	}: {
		Map2Str: Record<any, String>;
		selected: any;
		onclick: (ele: any) => void;
	} = $props();
</script>

<div class="flex gap-2">
	{#each Object.keys(Map2Str) as keyEle}
		<Button
			variant={selected === keyEle ? 'default' : 'outline'}
			size="sm"
			onclick={() => onclick(keyEle)}
		>
			{Map2Str[keyEle]}
		</Button>
	{/each}
</div>
