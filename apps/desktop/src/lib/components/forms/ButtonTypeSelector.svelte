<script lang="ts" module>
    import { Button } from '$ui/button';
    import * as Select from '$ui/select';
    import { ALL_BUTTON_TYPES, buttonTypeLabels, type ButtonType } from '$lib/settings/Layout';
    import { Plus } from 'lucide-svelte';

    interface Props {
        onAddButton: (type: ButtonType, section: 'left' | 'center' | 'right') => void;
        section: 'left' | 'center' | 'right';
        disabled?: boolean;
    }
</script>

<script lang="ts">
    const { onAddButton, section, disabled = false }: Props = $props();

    let selectedType: string | undefined = $state(undefined);

    function handleAddButton() {
        if (selectedType) {
            onAddButton(selectedType as ButtonType, section);
            selectedType = undefined; // 重置选择
        }
    }
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
