<script lang="ts" module>
    import { Label } from '$ui/label';
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
        className = 'app-title truncate',
        disabled = false,
        ...others
    }: Props = $props();
</script>

<div class={className}>
    <Label data-tauri-drag-region class="text-foreground font-bold" {...others}>{appTitle}</Label>
</div>
