<script lang="ts">
    import { Button } from '$ui/button';
    import { Input } from '$ui/input';
    import { RotateCcw } from 'lucide-svelte';

    let {
        value,
        defaultValue = '',
        placeholder = '',
        disabled = false,
        onSave
    }: {
        value: string;
        defaultValue?: string;
        placeholder?: string;
        disabled?: boolean;
        onSave: (value: string) => void;
    } = $props();

    let draft = $state(value);

    $effect(() => {
        draft = value;
    });

    function save() {
        if (disabled) return;
        onSave(draft);
    }

    function reset() {
        if (disabled) return;
        draft = defaultValue;
        onSave(defaultValue);
    }
</script>

<Input id="fontFamily" bind:value={draft} {placeholder} class="flex-1" {disabled} />
<Button variant="outline" {disabled} onclick={save}>Save</Button>
<Button variant="outline" {disabled} onclick={reset} aria-label="重置字体族">
    <RotateCcw />
</Button>
