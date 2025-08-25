<script lang="ts" module>
	import ConfigurableBar from './ConfigurableBar.svelte';
	import { APP_STATE } from '$lib/stores/appState';
	import { inject } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
</script>

<script lang="ts">
	const currentSettings = inject(USER_SETTINGS);
	const titleConfig = $state($currentSettings.layout.layoutConfigs.titlebar);
	const appState = inject(APP_STATE);
</script>

<div
	data-tauri-drag-region={!$appState.fullscreen}
	id="titlebar"
	class:hidden={!$currentSettings.layout.titlebar}
	class="bg-card border-muted fixed left-0 right-0 top-0 flex h-8 w-full select-none items-center justify-between border-b"
>
	<ConfigurableBar config={titleConfig} className="flex w-full items-center justify-between px-2" />
</div>

<style>
</style>
