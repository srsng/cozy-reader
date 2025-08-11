<script lang="ts" module>
	import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { SHORTCUT_ENENT } from '$lib/shortcuts/shortcutService';
	import { emit } from '@tauri-apps/api/event';
	import { m } from '$lib/paraglide/messages';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
</script>

<script lang="ts">
	const { label = false }: { label?: boolean } = $props();

	const userSettings = inject(USER_SETTINGS);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex gap-2" oncontextmenu={(e) => e.preventDefault()}>
	<Button
		size="icon"
		title={m['settings.zoom-out']()}
		onclick={() => emit(SHORTCUT_ENENT, 'zoom-out')}
	>
		<ZoomOut />
	</Button>
	{#if label}
		<Button title={m['settings.zoom-current']()} variant="ghost">
			<Label>
				{($userSettings.base.zoom * 100).toFixed(1)}%
			</Label>
		</Button>
	{/if}
	<Button
		size="icon"
		title={m['settings.zoom-in']()}
		onclick={() => emit(SHORTCUT_ENENT, 'zoom-in')}
	>
		<ZoomIn />
	</Button>
	<!-- reset -->
	<Button
		size="icon"
		title={m['settings.zoom-reset']()}
		onclick={() => emit(SHORTCUT_ENENT, 'zoom-reset')}
	>
		<RotateCcw />
	</Button>
</div>
