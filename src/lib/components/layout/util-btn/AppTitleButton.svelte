<script lang="ts" module>
	import Label from '$lib/components/ui/label/label.svelte';
	import { APP_STATE } from '$lib/stores/appState';
	import { inject } from '$lib/utils/context';
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

	const appState = inject(APP_STATE);
</script>

<div data-tauri-drag-region={!$appState.fullscreen} class={className}>
	<Label
		data-tauri-drag-region={!$appState.fullscreen}
		class="text-foreground font-bold"
		{...others}>{appTitle}</Label
	>
</div>
