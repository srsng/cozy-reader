<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Check } from 'lucide-svelte';
    import type { CommentType } from '@cozy-reader/database';

    interface Props {
        isVertical: boolean;
        style: Record<string, string>;
        selectedStyle: CommentType;
        selectedColor: string;
        onHandleHighlight: (update: boolean) => void;
    }

    const {
        isVertical,
        style,
        selectedStyle: _selectedStyle,
        selectedColor: _selectedColor,
        onHandleHighlight
    }: Props = $props();

    // TODO: 从设置 store 获取自定义颜色
    const customColors: Record<string, string> = {
        red: '#ef4444',
        violet: '#a855f7',
        blue: '#3b82f6',
        green: '#22c55e',
        yellow: '#eab308'
    };

    // 高亮样式类型（对应 CommentType）
    const styles: CommentType[] = ['highlight', 'underline', 'strike'];
    const colors = ['red', 'violet', 'blue', 'green', 'yellow'];

    let selectedStyle = $state(_selectedStyle);
    let selectedColor = $state(_selectedColor);

    const handleSelectStyle = (style: CommentType) => {
        selectedStyle = style;
        // TODO: 保存到设置 store
        onHandleHighlight(true);
    };

    const handleSelectColor = (color: string) => {
        selectedColor = color;
        // TODO: 保存到设置 store
        onHandleHighlight(true);
    };
</script>

<div
    class="absolute flex items-center justify-between {isVertical ? 'flex-col' : 'flex-row'}"
    style={Object.entries(style)
        .map(([k, v]) => `${k}: ${v};`)
        .join(' ')}
>
    <div
        class="flex gap-2 {isVertical ? 'flex-col' : 'flex-row'}"
        style={isVertical ? 'width: 28px;' : 'height: 28px;'}
    >
        {#each styles as style}
            <Button
                variant="ghost"
                size="icon"
                class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 p-0 hover:bg-gray-600"
                onclick={() => handleSelectStyle(style)}
            >
                <div
                    class="w-4 text-center leading-none {style === 'strike' ? 'h-[18px]' : 'h-4'}"
                    style="
                        {style === 'highlight' && selectedStyle === 'highlight'
                        ? `background-color: ${customColors[selectedColor]}; padding-top: 2px;`
                        : ''}
                        {style === 'highlight' && selectedStyle !== 'highlight'
                        ? 'background-color: #d1d5db; padding-top: 2px;'
                        : ''}
                        {(style === 'underline' || style === 'strike') &&
                        `color: #d1d5db; text-decoration: underline; text-decoration-thickness: 2px; text-decoration-color: ${selectedStyle === style ? customColors[selectedColor] : '#d1d5db'}; ${style === 'strike' ? 'text-decoration-style: wavy;' : ''}`}
                    "
                >
                    A
                </div>
            </Button>
        {/each}
    </div>

    <div
        class="flex items-center justify-center gap-2 rounded-3xl bg-gray-700 {isVertical
            ? 'flex-col py-2'
            : 'flex-row px-2'}"
        style={isVertical ? 'width: 28px;' : 'height: 28px;'}
    >
        {#each colors as color}
            <Button
                variant="ghost"
                size="icon"
                class="h-4 w-4 rounded-full p-0"
                style="background-color: {selectedColor !== color
                    ? customColors[color]
                    : 'transparent'};"
                onclick={() => handleSelectColor(color)}
            >
                {#if selectedColor === color}
                    <Check class="h-4 w-4" style="fill: {customColors[color]};" />
                {/if}
            </Button>
        {/each}
    </div>
</div>
