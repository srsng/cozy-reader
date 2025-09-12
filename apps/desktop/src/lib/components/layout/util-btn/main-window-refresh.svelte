<script lang="ts" module>
	import { RefreshCcw } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '@cozy/ui/button';
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
		name = 'refresh-button',
		title = '刷新页面',
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
	onclick={onClick || (() => emitMainWindowEvent('refresh-page'))}
	{...others}
>
	<RefreshCcw class={iconClass} />
</Button>
