<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Type } from 'lucide-svelte';
    import { readerStore } from '$lib/reader/stores/readerStore';

    interface Props {
        bookKey: string;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }

    let { bookKey, open = $bindable(false), onOpenChange }: Props = $props();

    const handleToggleSettings = () => {
        readerStore.setHoveredBookKey('');
        // 触发设置对话框打开事件
        window.dispatchEvent(
            new CustomEvent('settings-open', {
                detail: { bookKey },
                bubbles: true
            })
        );
        // 更新本地状态
        open = !open;
        onOpenChange?.(open);
    };
</script>

<Button variant="ghost" size="icon" onclick={handleToggleSettings} title="阅读器设置">
    <Type class="h-4 w-4" />
</Button>
