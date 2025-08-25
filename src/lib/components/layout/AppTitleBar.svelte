<script lang="ts">
	import ConfigurableBar from './ConfigurableBar.svelte';
	import { DefaultTitleBarConfig } from '$lib/settings/Layout';

	const { config = DefaultTitleBarConfig } = $props<{
		config?: typeof DefaultTitleBarConfig;
		appTitle?: string;
	}>();
</script>

<div
	data-tauri-drag-region
	id="titlebar"
	class="bg-card border-muted fixed left-0 right-0 top-0 flex h-8 w-full select-none items-center justify-between border-b"
>
	<ConfigurableBar {config} className="flex w-full items-center justify-between px-2" />
</div>

<style>
</style>
