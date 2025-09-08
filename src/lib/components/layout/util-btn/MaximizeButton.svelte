<script lang="ts" module>
	import { Maximize2 } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';

	interface Props {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		onClick?: (() => void) | undefined;
	}
</script>

<script lang="ts">
	const {
		name = 'maximize-button',
		title = '最大化',
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		onClick = undefined,
		...others
	}: Props = $props();
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	onclick={onClick || (() => emitMainWindowEvent('maximize'))}
	{...others}
>
	<Maximize2 class={iconClass} />
</Button>
