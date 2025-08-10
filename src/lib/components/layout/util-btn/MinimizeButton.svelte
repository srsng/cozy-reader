<script lang="ts" module>
	import { Minus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
</script>

<script lang="ts">
	const {
		name = 'minimize-button',
		title = '最小化',
		variant = 'outline' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		onClick = undefined,
		...others
	} = $props<{
		name?: string;
		title?: string;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		onClick?: (() => void) | undefined;
	}>();
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	onclick={onClick || (() => emitMainWindowEvent('minimize'))}
	{...others}
>
	<Minus class={iconClass} />
</Button>
