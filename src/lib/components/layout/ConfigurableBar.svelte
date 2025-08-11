<script lang="ts" module>
	import { cn } from '$lib/utils.js';
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { BarConfig } from '$lib/settings/Layout';
	import BarSection from './BarSection.svelte';
	import { inject } from '$lib/utils/context';
	import { APP_STATE } from '$lib/stores/appState';

	export const barVariants = tv({
		base: '',
		variants: {
			variant: {
				default: '',
				titlebar: '',
				footbar: '',
				sidebar: ''
			},
			size: {
				default: ''
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type BarVariant = VariantProps<typeof barVariants>['variant'];
	export type BarSize = VariantProps<typeof barVariants>['size'];

	export type Barprops = {
		variant?: BarVariant;
		size?: BarSize;
	};
</script>

<script lang="ts">
	const appState = inject(APP_STATE);
	const {
		config,
		className = '',
		sectionClass = '',
		btnClass = 'size-6',
		btnDsiabled = false,
		iconClass = 'size-4',
		...others
	}: {
		config: BarConfig;
		className?: string;
		sectionClass?: string;
		btnClass?: string;
		btnDsiabled?: boolean;
		iconClass?: string;
	} = $props();

	const lr_class = cn(sectionClass, 'flex items-center gap-1');
	const md_class = cn(sectionClass, 'flex flex-1 items-center justify-center overflow-hidden');
</script>

<!-- <a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a> -->

<div class={className}>
	<BarSection
		appTitle={$appState.appTitle}
		buttons={config.left}
		className={lr_class}
		{btnClass}
		{btnDsiabled}
		{iconClass}
		{...others}
	/>
	<BarSection
		appTitle={$appState.appTitle}
		buttons={config.center}
		className={md_class}
		{btnClass}
		{btnDsiabled}
		{iconClass}
		{...others}
	/>
	<BarSection
		appTitle={$appState.appTitle}
		buttons={config.right}
		className={lr_class}
		{btnClass}
		{btnDsiabled}
		{iconClass}
		{...others}
	/>
</div>
