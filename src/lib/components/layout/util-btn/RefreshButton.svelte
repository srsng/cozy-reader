<script lang="ts" module>
	import { RefreshCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { saveAppWindowState } from '$lib/stores/WindowState';
</script>

<script lang="ts">
	const {
		name = 'refresh-button',
		title = '刷新页面',
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

	function refreshPage() {
		saveAppWindowState();
		window.location.reload();
	}
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	onclick={onClick || refreshPage}
	{...others}
>
	<RefreshCcw class={iconClass} />
</Button>
