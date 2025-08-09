<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setContext, type Snippet } from 'svelte';
	import { SETTINGS } from '$lib/settings';

	const { data, children }: { data: any; children: Snippet } = $props();
	setContext(SETTINGS, data.userSettings);

	// 只读，用于设置主题属性
	const { userSettings } = data;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<div class="app-layout" role="application" data-theme={$userSettings.base.themeMode}></div>
{@render children?.()}
