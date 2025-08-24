<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { Label } from '$lib/components/ui/label';

	let {
		ref = $bindable(null),
		class: className,
		label,
		description,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		label: string;
		description?: string;
		children?: any;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-content-item"
	class={cn(
		'hover:bg-muted/50 flex items-center gap-2 rounded-lg p-4 transition-colors',
		className
	)}
	{...restProps}
>
	<div class="max-w-[40%] flex-shrink-0 space-y-1">
		<Label>{label}</Label>
		{#if description}
			<p class="text-muted-foreground text-sm">{description}</p>
		{/if}
	</div>
	<div class="ml-auto flex max-w-[60%] flex-1 items-center justify-end gap-2">
		{@render children?.()}
	</div>
</div>
