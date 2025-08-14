<script lang="ts" module>
	import { cn } from '$lib/utils';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { SunMediumIcon, MoonIcon } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
</script>

<script lang="ts">
	const { className = {}, iconClass = {}, ...others } = $props();
</script>

<Button onclick={toggleMode} variant="outline" size="icon" class={className} {...others}>
	{#if mode.current === 'dark'}
		<div in:scale>
			<SunMediumIcon class={cn(iconClass, 'route-0 dark:route-90 size-5')} />
		</div>
	{:else}
		<div in:scale>
			<MoonIcon class={cn(iconClass, 'route-0 dark:-route-90 size-5')} />
		</div>
	{/if}
	<span class="sr-only">Toggle theme</span>
</Button>
