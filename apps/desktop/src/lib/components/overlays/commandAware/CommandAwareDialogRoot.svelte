<script lang="ts">
    import { Dialog as DialogPrimitive } from 'bits-ui';
    import { Dialog as DialogRoot } from '$ui/dialog';
    import { useDialogOpenContext } from './useDialogOpenContext.svelte';

    let { open = $bindable(false), ...restProps }: DialogPrimitive.RootProps = $props();

    useDialogOpenContext(() => open);
</script>

<DialogRoot bind:open {...restProps} />
