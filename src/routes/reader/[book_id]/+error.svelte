<script lang="ts">
	import { page } from '$app/state';
	import { X } from 'lucide-svelte';
	import InfoCard from '$lib/components/common/info-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { goReaderHome } from '$lib/utils/route.svelte';

	const error = $derived(page.error);
	const errorMessage = $derived(error?.message || '未知错误');
</script>

<svelte:head>
	<title>错误 - Cozy Reader</title>
</svelte:head>

<InfoCard title="错误" message={errorMessage}>
	{#snippet header()}
		<X class="text-destructive h-12 w-12" />
	{/snippet}
	{#snippet footer()}
		<Button variant="secondary" onclick={goReaderHome}>返回书库</Button>
	{/snippet}
</InfoCard>
