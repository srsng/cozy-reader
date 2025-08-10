<script lang="ts" module>
	import { Button } from '$lib/components/ui/button';
	import { writeToClipBoard } from '$lib/utils/clip';
	import AppIcon from '$lib/components/app-icon.svelte';
</script>

<script lang="ts">
	const {
		name = 'app-icon-button',
		title = 'Cozy Reader',
		variant = 'outline' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-5',
		appTitle = 'Cozy Reader',
		...others
	} = $props<{
		name?: string;
		title?: string;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		appTitle?: string;
	}>();
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	onclick={() => writeToClipBoard(appTitle)}
	{...others}
>
	<AppIcon class={iconClass} />
</Button>
