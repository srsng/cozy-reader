<script lang="ts">
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import {
		Card,
		CardContent,
		CardContentItem,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	const currentSettings = inject(USER_SETTINGS);

	let fontFamily = $state($currentSettings.reader.fontFamily);

	function handleSaveFontFamily() {
		$currentSettings.reader.fontFamily = fontFamily;
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>字体设置</CardTitle>
		<CardDescription>配置阅读器的字体相关选项</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<CardContentItem label="字体族" description="设置阅读器使用的字体">
			<Input
				id="fontFamily"
				bind:value={fontFamily}
				placeholder="请输入字体名称，如：'Microsoft YaHei', sans-serif"
				class="flex-1"
			/>
			<Button variant="outline" onclick={handleSaveFontFamily}>Save</Button>
		</CardContentItem>
		<CardContentItem
			label="字体大小"
			description="调整文字大小: {$currentSettings.reader.fontSize}px"
		>
			<Slider
				type="single"
				bind:value={$currentSettings.reader.fontSize}
				min={12}
				max={48}
				step={1}
				class="flex-1"
			/>
			<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
				{$currentSettings.reader.fontSize}px
			</span>
		</CardContentItem>
		<CardContentItem label="行高" description="调整行间距: {$currentSettings.reader.lineHeight}%">
			<Slider
				type="single"
				bind:value={$currentSettings.reader.lineHeight}
				min={120}
				max={300}
				step={10}
				class="flex-1"
			/>
			<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
				{$currentSettings.reader.lineHeight}%
			</span>
		</CardContentItem>
	</CardContent>
</Card>

<Card>
	<CardHeader>
		<CardTitle>布局设置</CardTitle>
		<CardDescription>配置阅读器的布局选项</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<CardContentItem label="阅读器宽度" description="调整阅读区域宽度">
			<Slider
				type="single"
				bind:value={$currentSettings.reader.viewerWidth}
				min={30}
				max={90}
				step={5}
				class="flex-1"
			/>
			<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
				{$currentSettings.reader.viewerWidth}%
			</span>
		</CardContentItem>
		<CardContentItem label="首行缩进" description="段落首行自动缩进">
			<Switch bind:checked={$currentSettings.reader.firstLineIndent} />
		</CardContentItem>
		<CardContentItem label="长图缩放" description="自动缩放长图片以适应阅读高度">
			<Switch bind:checked={$currentSettings.reader.zoomLongPic} />
		</CardContentItem>
		<CardContentItem label="滚动条可见" description="显示滚动条">
			<Switch bind:checked={$currentSettings.reader.scrollBarVisable} />
		</CardContentItem>
	</CardContent>
</Card>
