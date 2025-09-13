<script lang="ts" module>
	import { House } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '$ui/button';
	import { goHome } from '$lib/utils/route.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<script lang="ts">
	const {
		name = 'home-button',
		title = m['settings.go home'](),
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
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
	id={name}
	{title}
	{variant}
	{size}
	class={className}
	onclick={onClick || goHome}
	{...others}
>
	<House class={iconClass} />
</Button>
