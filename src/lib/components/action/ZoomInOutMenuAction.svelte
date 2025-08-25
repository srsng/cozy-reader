<script lang="ts">
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';
	import { inject } from '$lib/utils/context';
	import { mergeUnlisten } from '$lib/utils/mergeUnlisten';
	import { onMount } from 'svelte';

	const userSettings = inject(USER_SETTINGS);
	const shortcutService = inject(SHORTCUT_SERVICE);

	let zoom = $state($userSettings.base.zoom);

	const MIN_ZOOM = 0.375;
	const MAX_ZOOM = 4;
	const DEFAULT_ZOOM = 1;
	const ZOOM_STEP = 0.0625;

	function setDomZoom(zoom: number) {
		document.documentElement.style.fontSize = zoom + 'rem';
	}

	function updateZoom(newZoom: number) {
		zoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
		setDomZoom(zoom);
		$userSettings.base.zoom = zoom;
	}

	$effect(() =>
		mergeUnlisten(
			shortcutService.on('zoom-in', () => {
				updateZoom(zoom + ZOOM_STEP);
			}),
			shortcutService.on('zoom-out', () => {
				updateZoom(zoom - ZOOM_STEP);
			}),
			shortcutService.on('zoom-reset', () => {
				updateZoom(DEFAULT_ZOOM);
			})
		)
	);

	onMount(() => {
		if (zoom !== DEFAULT_ZOOM) {
			setDomZoom(zoom);
		}
	});
</script>
