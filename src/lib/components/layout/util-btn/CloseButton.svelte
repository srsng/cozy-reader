<script lang="ts" module>
	import { X } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
</script>

<script lang="ts">
	const {
		name = 'close-button',
		title = '关闭',
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6 hover:bg-destructive hover:text-destructive-foreground',
		iconClass = 'size-4',
		onClick = undefined,
		...others
	}: {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		onClick?: (() => void) | undefined;
	} = $props();
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	{...others}
	onclick={onClick || (() => emitMainWindowEvent('close'))}
>
	<X class={iconClass} />
</Button>
