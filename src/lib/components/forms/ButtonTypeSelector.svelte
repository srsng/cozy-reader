<script lang="ts" module>
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { ALL_BUTTON_TYPES, type ButtonType } from '$lib/settings/Layout';
	import { Plus } from 'lucide-svelte';
</script>

<script lang="ts">
	const {
		onAddButton,
		section,
		disabled = false
	} = $props<{
		onAddButton: (type: ButtonType, section: 'left' | 'center' | 'right') => void;
		section: 'left' | 'center' | 'right';
		disabled?: boolean;
	}>();

	let selectedType: string | undefined = $state(undefined);

	function handleAddButton() {
		if (selectedType) {
			onAddButton(selectedType as ButtonType, section);
			selectedType = undefined; // 重置选择
		}
	}

	// 按钮类型的中文映射
	const buttonTypeLabels: Record<ButtonType, string> = {
		home: '主页',
		back: '返回',
		settings: '设置',
		refresh: '刷新',
		zoom: '缩放',
		'app-icon': '应用图标',
		'app-title': '应用标题',
		'always-on-top': '置顶',
		drag: '拖拽',
		minimize: '最小化',
		maximize: '最大化',
		fullscreen: '全屏',
		close: '关闭',
		'theme-toggle': '主题切换',
		custom: '自定义'
	};
</script>

<div class="flex gap-2">
	<Select.Root type="single" bind:value={selectedType} {disabled}>
		<Select.Trigger class="w-[180px]">
			{selectedType ? buttonTypeLabels[selectedType as ButtonType] : '选择按钮类型'}
		</Select.Trigger>
		<Select.Content>
			{#each ALL_BUTTON_TYPES as type}
				<Select.Item value={type}>
					{buttonTypeLabels[type] || type}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Button
		variant="outline"
		size="sm"
		onclick={handleAddButton}
		disabled={disabled || !selectedType}
	>
		<Plus class="h-4 w-4" />
		<p class="ml-1 hidden lg:block">添加</p>
	</Button>
</div>
