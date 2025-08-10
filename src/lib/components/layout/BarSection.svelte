<script lang="ts" module>
	import type { ButtonConfig } from '$lib/settings/Layout';
	import BarButton from './util-btn/BarButton.svelte';
</script>

<script lang="ts">
	const {
		appTitle,
		buttons,
		className = '',
		btnClass = '',
		btnDsiabled = false,
		iconClass = 'size-4'
	}: {
		appTitle: string;
		buttons: ButtonConfig[];
		className?: string;
		btnClass?: string;
		btnDsiabled?: boolean;
		iconClass?: string;
	} = $props();

	// 按order排序
	const sortedButtons = $derived([...buttons].sort((a, b) => a.order - b.order));
</script>

<div class={className}>
	{#each sortedButtons as button (button.name)}
		<BarButton config={button} className={btnClass} {appTitle} {btnDsiabled} {iconClass} />
	{/each}
</div>
