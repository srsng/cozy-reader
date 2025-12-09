<script lang="ts" module>
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { inject } from '$lib/utils/context';
    import { Label } from '$lib/components/ui/label';
    import * as Select from '$lib/components/ui/select';
    const { SelectContent, SelectItem, SelectTrigger } = Select;
    import { Slider } from '$lib/components/ui/slider';
    import { Switch } from '$lib/components/ui/switch';
    import * as Card from '$lib/components/ui/card';
    import {
        SERIF_FONTS,
        SANS_SERIF_FONTS,
        MONOSPACE_FONTS,
        CJK_SERIF_FONTS,
        CJK_SANS_SERIF_FONTS
    } from '$lib/reader/constants';
    import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
    import { ScrollArea } from '$components/ui/scroll-area';
</script>

<script lang="ts">
    const currentReaderSettings = inject(READER_SETTINGS);
</script>

<Card.Root class="flex h-full flex-col">
    <Card.Header>
        <Card.Title>字体设置</Card.Title>
        <Card.Description>配置阅读器的字体相关选项</Card.Description>
    </Card.Header>
    <Card.Content class="min-h-0 flex-1">
        <ScrollArea class="h-full">
            <div class="space-y-4 pb-6">
                <Card.ContentItem label="默认字体" description="选择默认字体类型">
                    <Select.Root type="single" bind:value={$currentReaderSettings.defaultFont}>
                        <SelectTrigger>
                            {$currentReaderSettings.defaultFont === 'Serif'
                                ? '衬线字体'
                                : $currentReaderSettings.defaultFont === 'Sans-serif'
                                  ? '无衬线字体'
                                  : '选择字体'}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Serif">衬线字体</SelectItem>
                            <SelectItem value="Sans-serif">无衬线字体</SelectItem>
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>

                <Card.ContentItem
                    label="字体大小"
                    description="调整文字大小: {$currentReaderSettings.defaultFontSize}px"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.defaultFontSize}
                        defaultValue={16}
                        min={8}
                        max={32}
                        step={1}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.defaultFontSize}px
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem
                    label="最小字体大小"
                    description="调整最小文字大小: {$currentReaderSettings.minimumFontSize}px"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.minimumFontSize}
                        defaultValue={8}
                        min={4}
                        max={16}
                        step={1}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.minimumFontSize}px
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem label="衬线字体" description="选择衬线字体族">
                    <Select.Root type="single" bind:value={$currentReaderSettings.serifFont}>
                        <SelectTrigger>
                            {$currentReaderSettings.serifFont || '选择衬线字体'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each SERIF_FONTS as font}
                                <SelectItem value={font}>{font}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>

                <Card.ContentItem label="无衬线字体" description="选择无衬线字体族">
                    <Select.Root type="single" bind:value={$currentReaderSettings.sansSerifFont}>
                        <SelectTrigger>
                            {$currentReaderSettings.sansSerifFont || '选择无衬线字体'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each SANS_SERIF_FONTS as font}
                                <SelectItem value={font}>{font}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>

                <Card.ContentItem label="等宽字体" description="选择等宽字体族">
                    <Select.Root type="single" bind:value={$currentReaderSettings.monospaceFont}>
                        <SelectTrigger>
                            {$currentReaderSettings.monospaceFont || '选择等宽字体'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each MONOSPACE_FONTS as font}
                                <SelectItem value={font}>{font}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>

                <Card.ContentItem label="CJK 默认字体" description="选择中日韩文字的默认字体">
                    <Select.Root type="single" bind:value={$currentReaderSettings.defaultCJKFont}>
                        <SelectTrigger>
                            {$currentReaderSettings.defaultCJKFont || '选择 CJK 字体'}
                        </SelectTrigger>
                        <SelectContent>
                            {#each [...CJK_SERIF_FONTS, ...CJK_SANS_SERIF_FONTS] as font}
                                <SelectItem value={font}>{font}</SelectItem>
                            {/each}
                        </SelectContent>
                    </Select.Root>
                </Card.ContentItem>

                <Card.ContentItem
                    label="字体粗细"
                    description="调整字体粗细: {$currentReaderSettings.fontWeight}"
                >
                    <SliderWithControls
                        bind:value={$currentReaderSettings.fontWeight}
                        defaultValue={400}
                        min={100}
                        max={900}
                        step={100}
                    >
                        {#snippet valueLabel()}
                            <span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
                                {$currentReaderSettings.fontWeight}
                            </span>
                        {/snippet}
                    </SliderWithControls>
                </Card.ContentItem>

                <Card.ContentItem label="覆盖书籍字体" description="是否覆盖书籍自带的字体设置">
                    <Switch bind:checked={$currentReaderSettings.overrideFont} />
                </Card.ContentItem>
            </div>
        </ScrollArea>
    </Card.Content>
</Card.Root>
