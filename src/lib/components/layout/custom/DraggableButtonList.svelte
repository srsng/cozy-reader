<!-- todo -->
<script lang="ts" module>
	import type { ButtonConfig } from '$lib/settings/Layout';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-svelte';
</script>

<script lang="ts">
	const { buttons, onReorder, onToggle, onRemove } = $props<{
		buttons: ButtonConfig[];
		onReorder: (fromIndex: number, toIndex: number) => void;
		onToggle: (buttonId: string) => void;
		onRemove: (buttonId: string) => void;
	}>();

	let draggedIndex: number | null = $state(null);
	let draggedOverIndex: number | null = $state(null);

	function handleDragStart(index: number) {
		draggedIndex = index;
	}

	function handleDragOver(index: number, event: DragEvent) {
		event.preventDefault();
		draggedOverIndex = index;
	}

	function handleDrop(index: number) {
		if (draggedIndex !== null && draggedIndex !== index) {
			onReorder(draggedIndex, index);
		}
		draggedIndex = null;
		draggedOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		draggedOverIndex = null;
	}

	function moveUp(index: number) {
		if (index > 0) {
			onReorder(index, index - 1);
		}
	}

	function moveDown(index: number) {
		if (index < buttons.length - 1) {
			onReorder(index, index + 1);
		}
	}
</script>

<div class="space-y-2">
	{#each buttons as button, index (button.name)}
		<!-- todo -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="bg-background flex cursor-move items-center gap-2 rounded-lg border p-2"
			class:border-primary={draggedOverIndex === index}
			class:opacity-50={draggedIndex === index}
			draggable="true"
			ondragstart={() => handleDragStart(index)}
			ondragover={(e) => handleDragOver(index, e)}
			ondrop={() => handleDrop(index)}
			ondragend={handleDragEnd}
		>
			<GripVertical class="text-muted-foreground h-4 w-4" />
			<Badge variant={button.enabled ? 'default' : 'secondary'}>
				{button.type}
			</Badge>
			<span class="text-muted-foreground text-sm">#{button.order}</span>
			<div class="ml-auto flex gap-1">
				<Button
					variant="ghost"
					size="sm"
					onclick={() => moveUp(index)}
					disabled={index === 0}
					title="向上移动"
				>
					<ChevronUp class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onclick={() => moveDown(index)}
					disabled={index === buttons.length - 1}
					title="向下移动"
				>
					<ChevronDown class="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onclick={() => onToggle(button.name)}>
					{button.enabled ? '启用' : '禁用'}
				</Button>
				<Button variant="outline" size="sm" onclick={() => onRemove(button.name)}>
					<Trash2 class="h-4 w-4" />
				</Button>
			</div>
		</div>
	{/each}
</div>
