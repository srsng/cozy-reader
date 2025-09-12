<script lang="ts" module>
	import { Button, type ButtonVariant } from '@cozy/ui/button';
</script>

<script lang="ts">
	const {
		name = 'custom-button',
		title = '自定义按钮',
		variant = 'bar' as const,
		size = 'icon' as const,
		className = 'size-6',
		iconClass = 'size-4',
		onClick = undefined,
		icon = undefined,
		content = undefined,
		...others
	}: {
		name?: string;
		title?: string;
		variant?: ButtonVariant;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		className?: string;
		iconClass?: string;
		onClick?: (() => void) | undefined;
		icon?: any;
		content?: any;
	} = $props();
</script>

<Button {name} {title} {variant} {size} {...others} class={className} onclick={onClick}>
	{#if icon}
		<icon class={iconClass}> </icon>
	{:else if content}
		{content}
	{:else}
		<div class={iconClass}>?</div>
	{/if}
</Button>
