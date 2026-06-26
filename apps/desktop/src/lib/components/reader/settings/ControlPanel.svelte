<script lang="ts" module>
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { inject } from '$lib/utils/context';
    import { Switch } from '$ui/switch';
    import * as Card from '$lib/components/ui/card';
    import * as Select from '$lib/components/ui/select';
    import type { ArrowKeyNavigationMode } from '$lib/reader/types';
    import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
    import { ScrollArea } from '$components/ui/scroll-area';
    const { SelectContent, SelectItem, SelectTrigger } = Select;
</script>

<script lang="ts">
    const currentReaderSettings = inject(READER_SETTINGS);

    const arrowKeyNavigationModeOptions: {
        value: ArrowKeyNavigationMode;
        label: string;
        description: string;
    }[] = [
        {
            value: 'vertical-section-horizontal-page',
            label: '上下章节，左右翻页',
            description: 'Up/k 上一章，Down/j 下一章，Left/h 上一页，Right/l 下一页'
        },
        {
            value: 'vertical-page-horizontal-section',
            label: '上下翻页，左右章节',
            description: 'Up/k 上一页，Down/j 下一页，Left/h 上一章，Right/l 下一章'
        }
    ];
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

                <Card.ContentItem
                    label="方向键导航"
                    description={arrowKeyNavigationModeOptions.find(
                        (option) => option.value === $currentReaderSettings.arrowKeyNavigationMode
                    )?.description ?? '选择方向键与 hjkl 的阅读器导航方式'}
                >
                    <Select.Root
                        type="single"
                        bind:value={$currentReaderSettings.arrowKeyNavigationMode}
                    >
                        <SelectTrigger>
                            {arrowKeyNavigationModeOptions.find(
                                (option) =>
                                    option.value ===
                                    $currentReaderSettings.arrowKeyNavigationMode
                            )?.label ?? '选择导航方式'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each arrowKeyNavigationModeOptions as option}
                                <SelectItem value={option.value}>{option.label}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
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
