<script lang="ts" module>
	import { Settings } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '@cozy/ui/button';
	import { goSettings } from '$lib/utils/route.svelte';
	import { m } from '$lib/paraglide/messages';
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
		name = 'settings-button',
		title = m['settings.go settings'](),
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
	onclick={onClick || (() => goSettings())}
	{...others}
>
	<Settings class={iconClass} />
</Button>
