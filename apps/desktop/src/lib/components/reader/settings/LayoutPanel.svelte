<script lang="ts" module>
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { inject } from '$lib/utils/context';
    import { Label } from '$lib/components/ui/label';
    import { Switch } from '$lib/components/ui/switch';
    import { Slider } from '$lib/components/ui/slider';
    import * as Card from '$lib/components/ui/card';
    import * as Select from '$lib/components/ui/select';
    const { SelectContent, SelectItem, SelectTrigger } = Select;
    import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
    import { ScrollArea } from '$components/ui/scroll-area';
</script>

<script lang="ts">
    const currentReaderSettings = inject(READER_SETTINGS);

    const writingModeOptions = [
        { value: 'auto', label: '自动' },
        { value: 'horizontal-tb', label: '水平（从左到右）' },
        { value: 'horizontal-rl', label: '水平（从右到左）' },
        { value: 'vertical-rl', label: '垂直（从右到左）' }
    ];

    const progressStyleOptions = [
        { value: 'percentage', label: '百分比' },
        { value: 'fraction', label: '分数' }
    ];

    const screenOrientationOptions = [
        { value: 'auto', label: '自动' },
        { value: 'portrait', label: '竖屏' },
        { value: 'landscape', label: '横屏' }
    ];
</script>

<Card.Root class="flex h-full flex-col">
    <Card.Header>
        <Card.Title>布局设置</Card.Title>
        <Card.Description>配置阅读器的布局选项</Card.Description>
    </Card.Header>
    <Card.Content class="min-h-0 flex-1">
        <ScrollArea class="h-full">
            <div class="space-y-4 pb-6">
                <Card.ContentItem label="视图模式" description="选择滚动或分页视图">
                    <div class="flex items-center justify-between">
                        <span class="text-muted-foreground text-sm">
                            {$currentReaderSettings.scrolled ? '滚动视图' : '分页视图'}
                        </span>
                        <Switch bind:checked={$currentReaderSettings.scrolled} />
                    </div>
                </Card.ContentItem>

                {#if !$currentReaderSettings.scrolled}
                    <Card.ContentItem
                        label="列数"
                        description="设置分页视图的列数: {$currentReaderSettings.maxColumnCount}"
                    >
                        <SliderWithControls
                            bind:value={$currentReaderSettings.maxColumnCount}
                            defaultValue={2}
                            min={1}
                            max={4}
                            step={1}
                        >
                            {#snippet valueLabel()}
                                <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                    {$currentReaderSettings.maxColumnCount}
                                </span>
                            {/snippet}
                        </SliderWithControls>
                    </Card.ContentItem>

                    <Card.ContentItem
                        label="最大列宽"
                        description="设置每列的最大宽度: {$currentReaderSettings.maxInlineSize}px"
                    >
                        <SliderWithControls
                            bind:value={$currentReaderSettings.maxInlineSize}
                            defaultValue={800}
                            min={400}
                            max={1200}
                            step={50}
                        >
                            {#snippet valueLabel()}
                                <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                    {$currentReaderSettings.maxInlineSize}px
                                </span>
                            {/snippet}
                        </SliderWithControls>
                    </Card.ContentItem>

                    <Card.ContentItem
                        label="最大列高"
                        description="设置每列的最大高度: {$currentReaderSettings.maxBlockSize}px"
                    >
                        <SliderWithControls
                            bind:value={$currentReaderSettings.maxBlockSize}
                            defaultValue={1200}
                            min={600}
                            max={2000}
                            step={100}
                        >
                            {#snippet valueLabel()}
                                <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                    {$currentReaderSettings.maxBlockSize}px
                                </span>
                            {/snippet}
                        </SliderWithControls>
                    </Card.ContentItem>

                    <Card.ContentItem label="翻页动画" description="启用翻页时的过渡动画效果">
                        <Switch bind:checked={$currentReaderSettings.animated} />
                    </Card.ContentItem>
                {/if}

                <Card.ContentItem
                    label="段落间距"
                    description="设置段落之间的间距: {$currentReaderSettings.paragraphMargin}em"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.paragraphMargin}
                        defaultValue={1}
                        min={0}
                        max={3}
                        step={0.1}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.paragraphMargin}em
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="行高"
                    description="设置文本行高: {$currentReaderSettings.lineHeight}"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.lineHeight}
                        defaultValue={1.6}
                        min={1}
                        max={3}
                        step={0.1}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.lineHeight}
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="词间距"
                    description="设置词之间的间距: {$currentReaderSettings.wordSpacing}em"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.wordSpacing}
                        defaultValue={0}
                        min={-0.5}
                        max={1}
                        step={0.1}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.wordSpacing}em
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="字间距"
                    description="设置字符之间的间距: {$currentReaderSettings.letterSpacing}em"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.letterSpacing}
                        defaultValue={0}
                        min={-0.1}
                        max={0.5}
                        step={0.01}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.letterSpacing}em
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="首行缩进"
                    description="设置段落首行缩进: {$currentReaderSettings.textIndent}em"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.textIndent}
                        defaultValue={0}
                        min={0}
                        max={3}
                        step={0.1}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.textIndent}em
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem label="两端对齐" description="启用文本两端对齐">
                    <Switch bind:checked={$currentReaderSettings.fullJustification} />
                </Card.ContentItem>

                <Card.ContentItem label="连字符" description="启用自动连字符">
                    <Switch bind:checked={$currentReaderSettings.hyphenation} />
                </Card.ContentItem>

                <Card.ContentItem label="书写模式" description="选择文本的书写方向">
                    <Select.Root type="single" bind:value={$currentReaderSettings.writingMode}>
                        <SelectTrigger>
                            {writingModeOptions.find(
                                (opt) => opt.value === $currentReaderSettings.writingMode
                            )?.label || '选择书写模式'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each writingModeOptions as option}
                                <SelectItem value={option.value}>{option.label}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>

                <Card.ContentItem label="垂直布局" description="启用垂直文本布局">
                    <Switch bind:checked={$currentReaderSettings.vertical} />
                </Card.ContentItem>

                <Card.ContentItem label="从右到左" description="启用从右到左的文本方向">
                    <Switch bind:checked={$currentReaderSettings.rtl} />
                </Card.ContentItem>

                <Card.ContentItem
                    label="顶部边距"
                    description="设置内容顶部边距: {$currentReaderSettings.marginTopPx}px"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.marginTopPx}
                        defaultValue={44}
                        min={0}
                        max={100}
                        step={4}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.marginTopPx}px
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="底部边距"
                    description="设置内容底部边距: {$currentReaderSettings.marginBottomPx}px"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.marginBottomPx}
                        defaultValue={44}
                        min={0}
                        max={100}
                        step={4}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.marginBottomPx}px
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="左侧边距"
                    description="设置内容左侧边距: {$currentReaderSettings.marginLeftPx}px"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.marginLeftPx}
                        defaultValue={16}
                        min={0}
                        max={100}
                        step={4}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.marginLeftPx}px
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="右侧边距"
                    description="设置内容右侧边距: {$currentReaderSettings.marginRightPx}px"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.marginRightPx}
                        defaultValue={16}
                        min={0}
                        max={100}
                        step={4}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.marginRightPx}px
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="列间距"
                    description="设置列之间的间距: {$currentReaderSettings.gapPercent}%"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.gapPercent}
                        defaultValue={5}
                        min={0}
                        max={20}
                        step={1}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.gapPercent}%
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem label="覆盖书籍布局" description="是否覆盖书籍自带的布局设置">
                    <Switch bind:checked={$currentReaderSettings.overrideLayout} />
                </Card.ContentItem>

                <Card.ContentItem label="双边框" description="显示双边框效果">
                    <Switch bind:checked={$currentReaderSettings.doubleBorder} />
                </Card.ContentItem>

                <Card.ContentItem label="滚动时显示栏" description="滚动时显示顶部和底部栏">
                    <Switch bind:checked={$currentReaderSettings.showBarsOnScroll} />
                </Card.ContentItem>

                <Card.ContentItem label="进度显示样式" description="选择进度信息的显示样式">
                    <Select.Root type="single" bind:value={$currentReaderSettings.progressStyle}>
                        <SelectTrigger>
                            {progressStyleOptions.find(
                                (opt) => opt.value === $currentReaderSettings.progressStyle
                            )?.label || '选择样式'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each progressStyleOptions as option}
                                <SelectItem value={option.value}>{option.label}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>

                <Card.ContentItem label="屏幕方向" description="锁定屏幕方向">
                    <Select.Root
                        type="single"
                        bind:value={$currentReaderSettings.screenOrientation}
                    >
                        <SelectTrigger>
                            {screenOrientationOptions.find(
                                (opt) => opt.value === $currentReaderSettings.screenOrientation
                            )?.label || '选择方向'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each screenOrientationOptions as option}
                                <SelectItem value={option.value}>{option.label}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>
            </div>
        </ScrollArea>
    </Card.Content>
</Card.Root>
