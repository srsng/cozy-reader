<script lang="ts">
    import { Dialog as SheetPrimitive } from 'bits-ui';
    import { Sheet as SheetRoot } from '$ui/sheet';
    import { useDialogOpenContext } from './useDialogOpenContext.svelte';

    let { open = $bindable(false), ...restProps }: SheetPrimitive.RootProps = $props();

    useDialogOpenContext(() => open);
</script>

<SheetRoot bind:open {...restProps} />
