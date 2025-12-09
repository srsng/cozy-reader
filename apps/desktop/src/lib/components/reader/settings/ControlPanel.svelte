<script lang="ts" module>
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { inject } from '$lib/utils/context';
    import { Switch } from '$ui/switch';
    import * as Card from '$lib/components/ui/card';
    import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
    import { ScrollArea } from '$components/ui/scroll-area';
</script>

<script lang="ts">
    const currentReaderSettings = inject(READER_SETTINGS);
</script>

<Card.Root class="flex h-full flex-col">
    <Card.Header>
        <Card.Title>控制设置</Card.Title>
        <Card.Description>配置阅读器的交互控制选项</Card.Description>
    </Card.Header>
    <Card.Content class="min-h-0 flex-1">
        <ScrollArea class="h-full">
            <div class="space-y-4 pb-6">
                <Card.ContentItem label="音量键翻页" description="使用音量键进行翻页操作">
                    <Switch bind:checked={$currentReaderSettings.volumeKeysToFlip} />
                </Card.ContentItem>

                <Card.ContentItem label="连续滚动" description="启用连续滚动模式">
                    <Switch bind:checked={$currentReaderSettings.continuousScroll} />
                </Card.ContentItem>

                <Card.ContentItem
                    label="滚动重叠"
                    description="设置滚动时的重叠距离: {$currentReaderSettings.scrollingOverlap}px"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.scrollingOverlap}
                        defaultValue={0}
                        min={0}
                        max={100}
                        step={10}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.scrollingOverlap}px
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem label="禁用点击" description="禁用点击翻页功能">
                    <Switch bind:checked={$currentReaderSettings.disableClick} />
                </Card.ContentItem>

                <Card.ContentItem label="交换点击区域" description="交换左右点击区域的功能">
                    <Switch bind:checked={$currentReaderSettings.swapClickArea} />
                </Card.ContentItem>

                <Card.ContentItem label="禁用双击" description="禁用双击缩放功能">
                    <Switch bind:checked={$currentReaderSettings.disableDoubleClick} />
                </Card.ContentItem>

                <Card.ContentItem label="允许脚本" description="允许书籍中的 JavaScript 脚本执行">
                    <Switch bind:checked={$currentReaderSettings.allowScript} />
                </Card.ContentItem>
            </div>
        </ScrollArea>
    </Card.Content>
</Card.Root>
