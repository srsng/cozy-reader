<script lang="ts" module>
	import { Button, type ButtonVariant } from '@cozy/ui/button';
	import { writeToClipBoard } from '$lib/utils/clip';
	import AppIcon from '$lib/components/common/app-icon.svelte';
	import { inject } from '$lib/utils/context';
	import { APP_STATE } from '$lib/stores/appState';

	interface Props {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		appTitle?: string;
	}
</script>

<script lang="ts">
	const appState = inject(APP_STATE);
	const {
		name = 'app-icon-button',
		title = $appState.appTitle,
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-5',
		appTitle = $appState.appTitle,
		...others
	}: Props = $props();
</script>

<Button
	{name}
	{title}
	{variant}
	{size}
	class={className}
	onclick={() => writeToClipBoard(appTitle, true)}
	{...others}
>
	<AppIcon class={iconClass} />
</Button>
