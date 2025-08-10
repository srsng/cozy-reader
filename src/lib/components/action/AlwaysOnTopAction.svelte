<script lang="ts">
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';
	import { inject } from '$lib/utils/context';
	import { mergeUnlisten } from '$lib/utils/mergeUnlisten';
	import { onMount } from 'svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';

	const userSettings = inject(USER_SETTINGS);
	const shortcutService = inject(SHORTCUT_SERVICE);

	const window = getCurrentWindow();

	function setAOT(aot: boolean) {
		window.setAlwaysOnTop(aot);
	}

	$effect(() =>
		mergeUnlisten(
			shortcutService.on('toggle-always-on-top', () => {
				$userSettings.base.alwaysOnTop = !$userSettings.base.alwaysOnTop;
				setAOT($userSettings.base.alwaysOnTop);
			})
		)
	);

	onMount(() => {
		setAOT($userSettings.base.alwaysOnTop);
	});
</script>
