<script lang="ts">
	import SimpleConfigurableBar from '$lib/components/layout/custom/SimpleConfigurableBar.svelte';
	import type { BarConfig } from '$lib/settings/Layout';

	let {
		config = $bindable(),
		className = '',
		sectionClass = '',
		btnClass = 'size-6',
		btnDisabled = true,
		iconClass = 'size-4',
		editable = true
	}: {
		config: BarConfig;
		className?: string;
		sectionClass?: string;
		btnClass?: string;
		btnDisabled?: boolean;
		iconClass?: string;
		editable?: boolean;
	} = $props();
</script>

<div class="space-y-4">
	<!-- 标题栏预览 - 保持与实际apptitlebar一样的样式 -->
	<div
		class="bg-card border-muted flex h-8 w-full select-none items-center justify-between border-b"
	>
		<SimpleConfigurableBar
			bind:config
			className="flex w-full items-center justify-between px-2"
			{sectionClass}
			btnClass="size-6"
			btnDisabled={editable ? false : btnDisabled}
			iconClass="size-4"
			{editable}
		/>
	</div>
	{#if editable}
		<p class="text-muted-foreground text-center text-xs">💡 提示：直接拖动按钮来重新排序</p>
	{/if}
</div>
