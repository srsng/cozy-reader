<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { SETTINGS, type Settings } from '$lib/settings';
	import { getContextStoreBySymbol } from '$lib/utils/context';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	const currentSettings = getContextStoreBySymbol<Settings, Writable<Settings>>(SETTINGS);

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
		<div class="space-y-2">
			<Label for="fontFamily">字体族</Label>
			<Input
				id="fontFamily"
				bind:value={fontFamily}
				placeholder="请输入字体名称，如：'Microsoft YaHei', sans-serif"
			/>
			<Button variant="outline" onclick={handleSaveFontFamily}>Save</Button>
		</div>
		<div class="space-y-2">
			<Label>字体大小: {$currentSettings.reader.fontSize}px</Label>
			<Slider
				type="single"
				bind:value={$currentSettings.reader.fontSize}
				min={12}
				max={48}
				step={1}
			/>
		</div>
		<div class="space-y-2">
			<Label>行高: {$currentSettings.reader.lineHeight}%</Label>
			<Slider
				type="single"
				bind:value={$currentSettings.reader.lineHeight}
				min={120}
				max={300}
				step={10}
			/>
		</div>
	</CardContent>
</Card>

<Card>
	<CardHeader>
		<CardTitle>布局设置</CardTitle>
		<CardDescription>配置阅读器的布局选项</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-2">
			<Label>阅读器宽度: {$currentSettings.reader.viewerWidth}%</Label>
			<Slider
				type="single"
				bind:value={$currentSettings.reader.viewerWidth}
				min={30}
				max={90}
				step={5}
			/>
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>首行缩进</Label>
				<p class="text-muted-foreground text-sm">段落首行自动缩进</p>
			</div>
			<Switch bind:checked={$currentSettings.reader.firstLineIndent} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>长图缩放</Label>
				<p class="text-muted-foreground text-sm">自动缩放长图片以适应阅读高度</p>
			</div>
			<Switch bind:checked={$currentSettings.reader.zoomLongPic} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>滚动条可见</Label>
				<p class="text-muted-foreground text-sm">显示滚动条</p>
			</div>
			<Switch bind:checked={$currentSettings.reader.scrollBarVisable} />
		</div>
	</CardContent>
</Card>
