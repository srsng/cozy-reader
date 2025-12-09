<script lang="ts" module>
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { inject } from '$lib/utils/context';
    import * as Card from '$lib/components/ui/card';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Label } from '$lib/components/ui/label';
    import { ScrollArea } from '$components/ui/scroll-area';
</script>

<script lang="ts">
    const currentReaderSettings = inject(READER_SETTINGS);
</script>

<Card.Root class="flex h-full flex-col">
    <Card.Header>
        <Card.Title>自定义样式</Card.Title>
        <Card.Description>配置自定义 CSS 样式表</Card.Description>
    </Card.Header>
    <Card.Content class="min-h-0 flex-1">
        <ScrollArea class="h-full">
            <div class="space-y-4 pb-6">
                <Card.ContentItem label="用户样式表" description="自定义书籍内容的 CSS 样式">
                    <Textarea
                        bind:value={$currentReaderSettings.userStylesheet}
                        placeholder="输入自定义 CSS 样式..."
                        class="min-h-[120px] font-mono text-sm"
                    />
                </Card.ContentItem>

                <Card.ContentItem label="UI 样式表" description="自定义阅读器界面的 CSS 样式">
                    <Textarea
                        bind:value={$currentReaderSettings.userUIStylesheet}
                        placeholder="输入自定义 UI CSS 样式..."
                        class="min-h-[120px] font-mono text-sm"
                    />
                </Card.ContentItem>
            </div>
        </ScrollArea>
    </Card.Content>
</Card.Root>
