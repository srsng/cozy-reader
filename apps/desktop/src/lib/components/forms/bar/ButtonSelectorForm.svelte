<script lang="ts">
	import { Button } from '$ui/button';
	import ButtonTypeSelector from '$lib/components/forms/ButtonTypeSelector.svelte';
	import { RotateCcw, Save } from 'lucide-svelte';
	import type { ButtonType } from '$lib/settings/Layout';
	import { slide } from 'svelte/transition';

	interface Props {
		onAddButton: (type: ButtonType, section: 'left' | 'center' | 'right') => void;
		onReset: () => void;
		onSave?: () => void;
		section?: 'left' | 'center' | 'right';
	}

	let { onAddButton, onReset, onSave, section = 'left' }: Props = $props();
</script>

<div class="flex items-center gap-3">
	<ButtonTypeSelector {onAddButton} {section} />
	{#if onSave}
		<Button variant="default" onclick={onSave} title="保存当前配置">
			<Save class="h-4 w-4" />
			<p class="ml-2 hidden lg:block">保存配置</p>
		</Button>
	{/if}
	<Button variant="outline" onclick={onReset} title="将所有配置重置为默认设置">
		<RotateCcw class="h-4 w-4" />
		<p class="ml-2 hidden lg:block">重置为默认</p>
	</Button>
</div>
