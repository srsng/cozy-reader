<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { slide } from 'svelte/transition';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	in:slide
	bind:this={ref}
	data-slot="card-action"
	class={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
	{...restProps}
>
	{@render children?.()}
</div>
