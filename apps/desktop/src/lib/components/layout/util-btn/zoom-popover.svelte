<script lang="ts" module>
	import { ZoomIn } from 'lucide-svelte';
	import { Button, type ButtonVariant } from '@cozy/ui/button';
	import { m } from '$lib/paraglide/messages';
	import * as Popover from '@cozy/ui/popover';
	import { ZoomForm } from '$lib/components/forms';

	interface Props {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
	}
</script>

<script lang="ts">
	const {
		name = 'zoom-button',
		title = m['settings.zoom'](),
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		...others
	}: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button {name} {title} {variant} {size} class={className} {...others}>
			<ZoomIn class={iconClass} />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-fit">
		<ZoomForm />
	</Popover.Content>
</Popover.Root>
