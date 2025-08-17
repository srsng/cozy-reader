<script lang="ts" module>
	import { Settings } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
	import { goSettings } from '$lib/utils/route.svelte';
	import { m } from '$lib/paraglide/messages';
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
	} = $props<{
		name?: string;
		title?: string;
		variant?: ButtonVariant;
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
	onclick={onClick || goSettings}
	{...others}
>
	<Settings class={iconClass} />
</Button>
