<script lang="ts" module>
	import Label from '$lib/components/ui/label/label.svelte';
</script>

<script lang="ts">
	const {
		name = 'app-title',
		appTitle,
		className = 'app-title truncate px-4',
		...others
	} = $props<{
		name?: string;
		appTitle?: string;
		className?: string;
	}>();
</script>

<div data-tauri-drag-region class={className}>
	<Label data-tauri-drag-region class="text-foreground font-bold" {...others}>{appTitle}</Label>
</div>
