<script lang="ts" module>
	import { onMount } from 'svelte';
	import { initializeTheme } from '$lib/theme/themeUtils';

	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
</script>

<script lang="ts">
	const userSettings = inject(USER_SETTINGS);

	onMount(() => {
		// 初始化主题
		initializeTheme($userSettings.theme.type, $userSettings.theme.data);
	});
</script>

<ModeWatcher defaultMode={$userSettings.theme.mode} defaultTheme={$userSettings.theme.type} />
