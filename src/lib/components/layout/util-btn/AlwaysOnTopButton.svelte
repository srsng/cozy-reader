<script lang="ts" module>
	import { Pin } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { emit } from '@tauri-apps/api/event';
	import { SHORTCUT_ENENT } from '$lib/shortcuts/shortcutService';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
</script>

<script lang="ts">
	const {
		name = 'always-on-top-button',
		title = '始终置顶',
		variant = 'outline' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		onClick = undefined,
		...others
	} = $props<{
		name?: string;
		title?: string;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		onClick?: (() => void) | undefined;
	}>();

	const currentSettings = inject(USER_SETTINGS);

	function switchAlwaysOnTop() {
		emit(SHORTCUT_ENENT, 'main-window-toggle-always-on-top');
	}
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	onclick={onClick || switchAlwaysOnTop}
	{...others}
>
	<Pin
		class="{iconClass} transition-transform {$currentSettings.base.alwaysOnTop ? 'rotate-45' : ''}"
	/>
</Button>
