<script lang="ts" module>
	import { ArrowLeft } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { canGoBack, goBack } from '$lib/utils/route.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<script lang="ts">
	const {
		name = 'back-button',
		title = m['settings.go back'](),
		variant = 'outline' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		onClick = undefined,
		...others
	}: {
		name?: string;
		title?: string;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
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
	onclick={onClick || goBack}
	disabled={!canGoBack()}
	{...others}
>
	<ArrowLeft class={iconClass} />
</Button>
