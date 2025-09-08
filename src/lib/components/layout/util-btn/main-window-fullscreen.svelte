<script lang="ts" module>
	import { Maximize, Minimize } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
	import { scale } from 'svelte/transition';
	import { APP_STATE } from '$lib/stores/appState';
	import { inject } from '$lib/utils/context';
</script>

<script lang="ts">
	const {
		name = 'fullscreen-button',
		title = '全屏',
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6 hover:bg-destructive hover:text-destructive-foreground',
		iconClass = 'size-4',
		...others
	}: {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
	} = $props();

	const appState = inject(APP_STATE);
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	{...others}
	onclick={() => emitMainWindowEvent('fullscreen')}
>
	{#if $appState.fullscreen}
		<div in:scale>
			<Minimize class={iconClass} />
		</div>
	{:else}
		<div in:scale>
			<Maximize class={iconClass} />
		</div>
	{/if}
	<span class="sr-only">Toggle Fullscreen</span>
</Button>
