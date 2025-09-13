<script lang="ts" module>
	import { X } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$ui/button';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
	import { cn } from '$lib/utils';
</script>

<script lang="ts">
	const {
		name = 'close-button',
		title = '关闭',
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
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
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={cn('hover:bg-destructive hover:text-destructive-foreground', className)}
	{...others}
	onclick={() => emitMainWindowEvent('close')}
>
	<X class={iconClass} />
</Button>
