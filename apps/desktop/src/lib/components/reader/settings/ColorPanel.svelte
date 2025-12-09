<script lang="ts" module>
    import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';
    import { inject } from '$lib/utils/context';
    import { Switch } from '$ui/switch';
    import * as Card from '$lib/components/ui/card';
    import * as Select from '$lib/components/ui/select';
    const { SelectContent, SelectItem, SelectTrigger } = Select;
    import { ScrollArea } from '$components/ui/scroll-area';
</script>

<script lang="ts">
    const currentReaderSettings = inject(READER_SETTINGS);

    const codeLanguageOptions = [
        { value: 'auto-detect', label: '自动检测' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'sql', label: 'SQL' }
    ];
</script>

<Card.Root class="flex h-full flex-col">
    <Card.Header>
        <Card.Title>颜色设置</Card.Title>
        <Card.Description>配置阅读器的颜色和主题选项</Card.Description>
    </Card.Header>
    <Card.Content class="min-h-0 flex-1">
        <ScrollArea class="h-full">
            <div class="space-y-4 pb-6">
                <Card.ContentItem label="覆盖书籍颜色" description="是否覆盖书籍自带的颜色设置">
                    <Switch bind:checked={$currentReaderSettings.overrideColor} />
                </Card.ContentItem>

                <Card.ContentItem label="深色模式图片反转" description="在深色模式下反转图片颜色">
                    <Switch bind:checked={$currentReaderSettings.invertImgColorInDark} />
                </Card.ContentItem>

                <Card.ContentItem label="代码高亮" description="启用代码语法高亮">
                    <Switch bind:checked={$currentReaderSettings.codeHighlighting} />
                </Card.ContentItem>

                {#if $currentReaderSettings.codeHighlighting}
                    <Card.ContentItem label="代码语言" description="选择代码高亮的默认语言">
                        <Select.Root type="single" bind:value={$currentReaderSettings.codeLanguage}>
                            <SelectTrigger>
                                {codeLanguageOptions.find(
                                    (opt) => opt.value === $currentReaderSettings.codeLanguage
                                )?.label || '选择语言'}
                            </SelectTrigger>
                            <SelectContent>
                                {#each codeLanguageOptions as option}
                                    <SelectItem value={option.value}>{option.label}</SelectItem>
                                {/each}
                            </SelectContent>
                        </Select.Root>
                    </Card.ContentItem>
                {/if}
            </div>
        </ScrollArea>
    </Card.Content>
</Card.Root>
