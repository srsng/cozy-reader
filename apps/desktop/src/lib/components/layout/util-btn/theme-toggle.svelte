<script lang="ts" module>
	import { cn } from '$lib/utils';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button, type ButtonVariant } from '$ui/button';
	import { SunMediumIcon, MoonIcon } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	interface Props {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
	}
</script>

<script lang="ts">
	const {
		name = 'theme-mode-toggle-button',
		title = '切换主题模式',
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		...others
	}: Props = $props();
</script>

<Button onclick={toggleMode} {name} {title} {variant} {size} class={className} {...others}>
	{#if mode.current === 'light'}
		<div in:scale>
			<SunMediumIcon class={cn(iconClass)} />
		</div>
	{:else}
		<div in:scale>
			<MoonIcon class={cn(iconClass)} />
		</div>
	{/if}
	<span class="sr-only">Toggle theme</span>
</Button>
