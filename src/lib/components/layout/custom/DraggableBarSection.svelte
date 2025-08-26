<script lang="ts" module>
	import type { ButtonConfig } from '$lib/settings/Layout';
	import BarButton from '../BarButton.svelte';
	import { cn } from '$lib/utils';
</script>

<script lang="ts">
	let {
		appTitle,
		buttons,
		section,
		className = '',
		btnClass = '',
		btnDisabled = false,
		iconClass = 'size-4',
		editable = false,
		draggedButton = $bindable(),
		dragOverTarget = $bindable(),
		isDragging = $bindable(),
		onGlobalDrop
	}: {
		appTitle: string;
		buttons: ButtonConfig[];
		section: 'left' | 'center' | 'right';
		className?: string;
		btnClass?: string;
		btnDisabled?: boolean;
		iconClass?: string;
		editable?: boolean;
		draggedButton?: {
			button: ButtonConfig;
			section: 'left' | 'center' | 'right';
			index: number;
		} | null;
		dragOverTarget?: { section: 'left' | 'center' | 'right'; index: number } | null;
		isDragging?: boolean;
		onGlobalDrop?: (
			fromSection: 'left' | 'center' | 'right',
			fromIndex: number,
			toSection: 'left' | 'center' | 'right',
			toIndex: number
		) => void;
	} = $props();

	// 按order排序
	const sortedButtons = $derived([...buttons].sort((a, b) => a.order - b.order));

	// 处理拖拽开始
	function handleDragStart(event: DragEvent, index: number) {
		if (!event.dataTransfer || !editable) return;

		// 检查索引是否有效
		if (index < 0 || index >= sortedButtons.length || !sortedButtons[index]) {
			console.warn('Invalid drag start index:', index, 'sortedButtons length:', sortedButtons.length);
			return;
		}

		// 获取被拖拽的按钮
		const button = sortedButtons[index];
		// 找到原始buttons数组中的索引
		const originalIndex = buttons.findIndex((b) => b.name === button.name);
		if (originalIndex === -1) {
			console.warn('Button not found in original array for:', button.name);
			return;
		}

		// 存储拖拽信息，使用sortedButtons的索引
		draggedButton = { button, section, index };
		isDragging = true;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData(
			'text/plain',
			JSON.stringify({ section, index, buttonName: button.name })
		);
	}

	// 处理拖拽结束
	function handleDragEnd() {
		draggedButton = null;
		dragOverTarget = null;
		isDragging = false;
	}

	// 处理拖拽经过
	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (!editable || !draggedButton) return;

		// 检查索引是否有效
		if (index < 0 || index >= sortedButtons.length || !sortedButtons[index]) {
			return;
		}

		// 不能拖拽到自己身上
		if (draggedButton.section === section && draggedButton.index === index) {
			return;
		}

		dragOverTarget = { section, index };
	}

	// 处理放置
	function handleDrop(event: DragEvent, index: number) {
		event.preventDefault();
		if (!editable || !draggedButton || !onGlobalDrop) return;

		// 检查索引是否有效
		if (index < 0 || index >= sortedButtons.length || !sortedButtons[index]) {
			return;
		}

		// 执行拖拽操作，使用sortedButtons的索引
		onGlobalDrop(draggedButton.section, draggedButton.index, section, index);

		handleDragEnd();
	}

	// 处理拖拽离开
	function handleDragLeave() {
		if (dragOverTarget?.section === section) {
			dragOverTarget = null;
		}
	}

	// 处理section容器的拖拽经过（用于空section）
	function handleSectionDragOver(event: DragEvent) {
		event.preventDefault();
		if (!editable || !draggedButton || buttons.length > 0) return;

		// 空section，设置为在末尾插入
		dragOverTarget = { section, index: 0 };
	}

	// 处理section容器的放置（用于空section）
	function handleSectionDrop(event: DragEvent) {
		event.preventDefault();
		if (!editable || !draggedButton || !onGlobalDrop || buttons.length > 0) return;

		// 在空section中插入
		onGlobalDrop(draggedButton.section, draggedButton.index, section, 0);

		handleDragEnd();
	}
</script>

<div
	class={cn(className, 'flex min-h-[32px] items-center gap-0', {
		'bg-primary/5 border-primary/30 border border-dashed':
			dragOverTarget?.section === section && buttons.length === 0
	})}
	role="region"
	aria-label="可拖拽按钮区域"
	ondragover={handleSectionDragOver}
	ondrop={handleSectionDrop}
	ondragleave={handleDragLeave}
>
	{#each sortedButtons as button, index (button.name)}
		{#if button.enabled}
			{@const isBeingDragged =
				draggedButton?.section === section && draggedButton?.index === index}
			{@const isDropTarget =
				dragOverTarget?.section === section &&
				dragOverTarget?.index === index &&
				!isBeingDragged}
			<div
				class={cn('transition-all duration-200', {
					'cursor-move': editable,
					'scale-95 opacity-50': isBeingDragged,
					'bg-primary/10 border-primary border-l-2': isDropTarget
				})}
				draggable={editable}
				ondragstart={(e) => handleDragStart(e, index)}
				ondragover={(e) => handleDragOver(e, index)}
				ondrop={(e) => handleDrop(e, index)}
				ondragend={handleDragEnd}
				ondragleave={handleDragLeave}
				role="button"
				tabindex="0"
				aria-label={`拖拽 ${button.type} 按钮`}
			>
				<BarButton config={button} className={btnClass} {appTitle} btnDisabled={true} {iconClass} />
			</div>
		{/if}
	{/each}

	{#if buttons.length === 0 && editable}
		<div class="text-muted-foreground px-2 py-1 text-xs italic">拖拽按钮到此处</div>
	{/if}
</div>
