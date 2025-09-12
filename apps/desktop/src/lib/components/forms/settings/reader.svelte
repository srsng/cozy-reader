<script lang="ts" module>
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
	import { DefaultReaderSettings } from '$lib/settings';
	import { RotateCcw } from 'lucide-svelte';
</script>

<script lang="ts">
	const currentSettings = inject(USER_SETTINGS);

	let fontFamilyState = $state($currentSettings.reader.fontFamily);

	function handleSaveFontFamily() {
		$currentSettings.reader.fontFamily = fontFamilyState;
	}

	function handleResetFontFamily() {
		$currentSettings.reader.fontFamily = DefaultReaderSettings.fontFamily;
		fontFamilyState = DefaultReaderSettings.fontFamily;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>字体设置</Card.Title>
		<Card.Description>配置阅读器的字体相关选项</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<Card.ContentItem label="字体族" description="设置阅读器使用的字体">
			<Input
				id="fontFamily"
				bind:value={fontFamilyState}
				placeholder="请输入字体名称，如：'Microsoft YaHei', sans-serif"
				class="flex-1"
			/>
			<Button variant="outline" onclick={handleSaveFontFamily}>Save</Button>
			<Button variant="outline" onclick={handleResetFontFamily}>
				<RotateCcw />
			</Button>
		</Card.ContentItem>
		<Card.ContentItem
			label="字体大小"
			description="调整文字大小: {$currentSettings.reader.fontSize}px"
		>
			<SliderWithControls
				bind:value={$currentSettings.reader.fontSize}
				defaultValue={DefaultReaderSettings.fontSize}
				min={12}
				max={48}
				step={1}
			>
				{#snippet valueLabel()}
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{$currentSettings.reader.fontSize}px
					</span>
				{/snippet}
			</SliderWithControls>
		</Card.ContentItem>
		<Card.ContentItem label="行高" description="调整行间距: {$currentSettings.reader.lineHeight}%">
			<SliderWithControls
				bind:value={$currentSettings.reader.lineHeight}
				defaultValue={DefaultReaderSettings.lineHeight}
				min={120}
				max={300}
				step={10}
			>
				{#snippet valueLabel()}
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{$currentSettings.reader.lineHeight}%
					</span>
				{/snippet}
			</SliderWithControls>
		</Card.ContentItem>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>布局设置</Card.Title>
		<Card.Description>配置阅读器的布局选项</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<Card.ContentItem label="阅读器宽度" description="调整阅读区域宽度">
			<SliderWithControls
				bind:value={$currentSettings.reader.viewerWidth}
				defaultValue={DefaultReaderSettings.viewerWidth}
				min={30}
				max={90}
				step={5}
			>
				{#snippet valueLabel()}
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{$currentSettings.reader.viewerWidth}%
					</span>
				{/snippet}
			</SliderWithControls>
		</Card.ContentItem>

		<Card.ContentItem label="首行缩进" description="段落首行自动缩进">
			<Switch bind:checked={$currentSettings.reader.firstLineIndent} />
		</Card.ContentItem>
		<Card.ContentItem label="长图缩放" description="自动缩放长图片以适应阅读高度">
			<Switch bind:checked={$currentSettings.reader.zoomLongPic} />
		</Card.ContentItem>
		<Card.ContentItem label="滚动条可见" description="显示滚动条">
			<Switch bind:checked={$currentSettings.reader.scrollBarVisable} />
		</Card.ContentItem>
	</Card.Content>
</Card.Root>
