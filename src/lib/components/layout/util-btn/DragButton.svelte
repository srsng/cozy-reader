<script lang="ts" module>
	import { Move } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
</script>

<script lang="ts">
	let {
		name = 'drag-button',
		title = '按住以拖拽移动',
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

<Button id={name} {title} {variant} {size} {...others} class={className} data-tauri-drag-region>
	<Move class={iconClass} data-tauri-drag-region />
</Button>
