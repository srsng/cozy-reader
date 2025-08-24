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
	class={cn('flex items-center justify-between', className)}
	{...restProps}
>
	<div class="space-y-0.5">
		<Label>{label}</Label>
		{#if description}
			<p class="text-muted-foreground text-sm">{description}</p>
		{/if}
	</div>
	{@render children?.()}
</div>