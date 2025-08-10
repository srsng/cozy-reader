<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		transitionFunc = undefined,
		transitionProps = {},
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		transitionFunc?: any;
		transitionProps?: any;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
		className
	)}
	{...restProps}
	transition:transitionFunc={transitionFunc ? transitionProps : undefined}
>
	{@render children?.()}
</div>
