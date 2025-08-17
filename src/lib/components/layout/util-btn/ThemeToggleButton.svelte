<script lang="ts" module>
	import { cn } from '$lib/utils';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
	import { SunMediumIcon, MoonIcon } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
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
	} = $props<{
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
	}>();
</script>

<Button onclick={toggleMode} {name} {title} {variant} {size} class={className} {...others}>
	{#if mode.current === 'light'}
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
