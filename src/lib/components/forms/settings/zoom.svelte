<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { emit } from '@tauri-apps/api/event';
	import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-svelte';
	import { SHORTCUT_ENENT } from '$lib/shortcuts/shortcutService';
</script>

<div class="flex gap-2">
	<Button size="icon" onclick={() => emit(SHORTCUT_ENENT, 'zoom-out')}>
		<ZoomOut />
	</Button>
	<Button size="icon" onclick={() => emit(SHORTCUT_ENENT, 'zoom-reset')}>
		<RotateCcw />
	</Button>
	<Button size="icon" onclick={() => emit(SHORTCUT_ENENT, 'zoom-in')}>
		<ZoomIn />
	</Button>
</div>
