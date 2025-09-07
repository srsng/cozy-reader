<script lang="ts" module>
	import { Wallpaper } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
	import { goBgSettings } from '$lib/utils/route.svelte';
</script>

<script lang="ts">
	const {
		name = 'bg-settings-button',
		title = 'go background settings',
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
	onclick={onClick || goBgSettings}
	{...others}
>
	<Wallpaper class={iconClass} />
</Button>
