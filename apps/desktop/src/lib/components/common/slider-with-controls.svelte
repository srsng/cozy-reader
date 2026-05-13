<script lang="ts" module>
    import { Button } from '$ui/button';
    import { Input } from '$ui/input';
    import { Plus, Minus, RotateCcw } from 'lucide-svelte';
    import type { Snippet } from 'svelte';
    import { Slider } from '$ui/slider';
    import * as ButtonGroup from "$ui/button-group";
    import { Label } from "$ui/label";
  

    interface Props {
        value: number;
        defaultValue: number;
        min: number;
        max: number;
        step: number;
        disabled?: boolean;
        input?: boolean;
        formatValue?: (value: number) => string;
        onValueChange?: (value: number) => void;
        valueLabel?: Snippet;
    }
</script>

<script lang="ts">

    let {
        value = $bindable(),
        defaultValue,
        min = 0,
        max = 100,
        step = 1,
        disabled = false,
        input = false,
        formatValue = (currentValue: number) => String(currentValue),
        onValueChange,
        valueLabel
    }: Props = $props();

    let previousValue = $state(value);
    let hasInitialized = $state(false);

    $effect(() => {
        if (!hasInitialized) {
            previousValue = value;
            hasInitialized = true;
            return;
        }
        if (value === previousValue) return;
        previousValue = value;
        onValueChange?.(value);
    });

    function increment() {
        if (disabled) return;
        value += step;
    }

    function decrement() {
        if (disabled) return;
        value -= step;
    }

    function reset() {
        if (disabled) return;
        value = defaultValue;
    }

    function updateFromInput(nextValue: string) {
        if (disabled) return;
        const parsedValue = Number(nextValue);
        if (Number.isNaN(parsedValue)) return;
        value = Math.min(Math.max(parsedValue, min), max);
    }

    function handleInputKeydown(event: KeyboardEvent) {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        event.stopPropagation();
        updateFromInput((event.currentTarget as HTMLInputElement).value);
    }
</script>

<Slider type="single" class="flex-1" bind:value {min} {max} {step} {disabled} />

<div class="flex items-center gap-1">
    {#if input}
        <Input
            value={String(value ?? '')}
            type="number"
            class="w-20"
            {min}
            {max}
            {step}
            {disabled}
            onchange={(event) => updateFromInput(event.currentTarget.value)}
            onblur={(event) => updateFromInput(event.currentTarget.value)}
            onkeydown={handleInputKeydown}
        />
    {:else if valueLabel}
        {@render valueLabel()}
    {:else}
        <Label class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
            {formatValue(value)}
        </Label>
    {/if}

    <ButtonGroup.Root>
        <Button variant="outline" size="icon" class="hidden h-8 w-8 lg:flex" {disabled} onclick={decrement}>
            <Minus class="h-3 w-3" />
        </Button>
        <Button variant="outline" size="icon" class="hidden h-8 w-8 lg:flex" {disabled} onclick={increment}>
            <Plus class="h-3 w-3" />
        </Button>

        <Button variant="outline" size="icon" class="hidden h-8 w-8 lg:flex" {disabled} onclick={reset}>
            <RotateCcw class="h-3 w-3" />
        </Button>
    </ButtonGroup.Root>

</div>
