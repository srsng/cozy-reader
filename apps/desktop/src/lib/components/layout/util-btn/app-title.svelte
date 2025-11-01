<script lang="ts" module>
    import { Label } from '$ui/label';
    import { APP_STATE } from '$lib/stores/appState';
    import { inject } from '$lib/utils/context';

    interface Props {
        name?: string;
        appTitle?: string;
        className?: string;
        disabled?: boolean;
    }
</script>

<script lang="ts">
    const {
        name = 'app-title',
        appTitle,
        className = 'app-title truncate px-4',
        disabled = false,
        ...others
    }: Props = $props();

    const appState = inject(APP_STATE);
</script>

<div data-tauri-drag-region={!$appState.fullscreen} class={className}>
    <Label
        data-tauri-drag-region={disabled ? false : !$appState.fullscreen}
        class="text-foreground font-bold"
        {...others}>{appTitle}</Label
    >
</div>
