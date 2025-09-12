<script lang="ts" module>
	import { Move } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '@cozy/ui/button';
	import { APP_STATE } from '$lib/stores/appState';
	import { inject } from '$lib/utils/context';
</script>

<script lang="ts">
	const {
		name = 'drag-button',
		title = '按住以拖拽移动',
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		disabled = false,
		...others
	}: {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		disabled?: boolean;
	} = $props();

	const appState = inject(APP_STATE);
</script>

<Button
	id={name}
	{title}
	{variant}
	{size}
	{...others}
	class={className}
	data-tauri-drag-region={disabled ? false : !$appState.fullscreen}
	disabled={disabled ? true : $appState.fullscreen}
>
	<Move class={iconClass} />
</Button>
