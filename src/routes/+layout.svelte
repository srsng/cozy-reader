<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { setContext, type Snippet } from 'svelte';
	import { SETTINGS } from '$lib/settings';
	import favicon from '$lib/assets/favicon.svg';

	const { data, children }: { data: any; children: Snippet } = $props();

	setContext(SETTINGS, data.userSettings);

	// 只读，用于设置主题属性
	const { userSettings } = data;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode={$userSettings.base.themeMode} />

<div class="app-layout" role="application"></div>
{@render children?.()}
