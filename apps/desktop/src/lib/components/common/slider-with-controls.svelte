<script lang="ts" module>
    import { Button } from '$ui/button';
    import { Plus, Minus, RotateCcw } from 'lucide-svelte';
    import type { Snippet } from 'svelte';
    import { Slider } from '$ui/slider';

    interface Props {
        value: number;
        defaultValue: number;
        min: number;
        max: number;
        step: number;
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
        valueLabel
    }: Props = $props();

    function increment() {
        value += step;
    }

    function decrement() {
        value -= step;
    }

    function reset() {
        value = defaultValue;
    }
</script>

<Slider type="single" class="flex-1" bind:value {min} {max} {step} />

<div class="flex items-center gap-1">
    {@render valueLabel?.()}

    <Button variant="outline" size="icon" class="h-8 w-8" onclick={decrement}>
        <Minus class="h-3 w-3" />
    </Button>
    <Button variant="outline" size="icon" class="h-8 w-8" onclick={increment}>
        <Plus class="h-3 w-3" />
    </Button>

    <Button variant="outline" size="icon" class="h-8 w-8" onclick={reset}>
        <RotateCcw class="h-3 w-3" />
    </Button>
</div>
