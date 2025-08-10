<script lang="ts">
	import type { BarConfig } from '$lib/settings/Layout';
	import { cn } from '$lib/utils';
	import BarSection from './BarSection.svelte';

	const {
		appTitle,
		config,
		className = '',
		sectionClass = '',
		btnClass = 'size-6',
		btnDsiabled = false,
		iconClass = 'size-4',
		...others
	}: {
		appTitle: string;
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

<div class={className}>
	<BarSection
		{appTitle}
		buttons={config.left}
		className={lr_class}
		{btnClass}
		{btnDsiabled}
		{iconClass}
		{...others}
	/>
	<BarSection
		{appTitle}
		buttons={config.center}
		className={md_class}
		{btnClass}
		{btnDsiabled}
		{iconClass}
		{...others}
	/>
	<BarSection
		{appTitle}
		buttons={config.right}
		className={lr_class}
		{btnClass}
		{btnDsiabled}
		{iconClass}
		{...others}
	/>
</div>
