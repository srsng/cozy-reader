<script lang="ts">
	import { inject } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { RotateCcw } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';

	const currentSettings = $state(inject(USER_SETTINGS));
</script>

<!-- 背景遮罩层 -->
<Card.Root>
	<Card.Header>
		<Card.Title>背景遮罩层</Card.Title>
		<Card.Description>在背景图片上方添加颜色遮罩和滤镜效果</Card.Description>
		<Card.Action>
			<Switch bind:checked={$currentSettings.background.global.backgroundOverlay.enabled} />
		</Card.Action>
	</Card.Header>
	<Separator />
	{#if $currentSettings.background.global.backgroundOverlay.enabled}
		<Card.Content class="space-y-4">
			<!-- 遮罩颜色 -->
			<Card.ContentItem label="遮罩颜色" description="选择遮罩层的颜色">
				<Input
					type="color"
					bind:value={$currentSettings.background.global.backgroundOverlay.color}
					class="h-10 w-20"
				/>
				<span class="text-muted-foreground ml-4 font-mono text-sm">
					{$currentSettings.background.global.backgroundOverlay.color.toUpperCase()}
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.backgroundOverlay.color = '#000000')}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 遮罩透明度 -->
			<Card.ContentItem label="遮罩透明度" description="调整遮罩层透明度: 0~100%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.opacity}
					min={0}
					max={1}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.backgroundOverlay.opacity * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.backgroundOverlay.opacity = 0.1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 亮度 -->
			<Card.ContentItem label="亮度" description="调整亮度: 0~200%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.filters.brightness}
					min={0}
					max={2}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round(
						$currentSettings.background.global.backgroundOverlay.filters.brightness * 100
					)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() =>
						($currentSettings.background.global.backgroundOverlay.filters.brightness = 1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 对比度 -->
			<Card.ContentItem label="对比度" description="调整对比度: 0~200%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.filters.contrast}
					min={0}
					max={2}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.backgroundOverlay.filters.contrast * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() =>
						($currentSettings.background.global.backgroundOverlay.filters.contrast = 1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 饱和度 -->
			<Card.ContentItem label="饱和度" description="调整饱和度: 0~2">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.filters.saturate}
					min={0}
					max={2}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.backgroundOverlay.filters.saturate * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() =>
						($currentSettings.background.global.backgroundOverlay.filters.saturate = 1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 模糊 -->
			<Card.ContentItem label="模糊" description="调整模糊程度: 0~20px">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.filters.blur}
					min={0}
					max={20}
					step={0.1}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{$currentSettings.background.global.backgroundOverlay.filters.blur.toFixed(1)}px
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.backgroundOverlay.filters.blur = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 灰度 -->
			<Card.ContentItem label="灰度" description="调整灰度程度: 0~100%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.filters.grayscale}
					min={0}
					max={1}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round(
						$currentSettings.background.global.backgroundOverlay.filters.grayscale * 100
					)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() =>
						($currentSettings.background.global.backgroundOverlay.filters.grayscale = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>

			<!-- 色相旋转 -->
			<Card.ContentItem label="色相旋转" description="调整色相旋转角度: 0~360°">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.filters.hueRotate}
					min={0}
					max={360}
					step={1}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.backgroundOverlay.filters.hueRotate)}°
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() =>
						($currentSettings.background.global.backgroundOverlay.filters.hueRotate = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>

			<!-- 反转 -->
			<Card.ContentItem label="反转" description="调整反转程度: 0~100%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.backgroundOverlay.filters.invert}
					min={0}
					max={1}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.backgroundOverlay.filters.invert * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.backgroundOverlay.filters.invert = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
		</Card.Content>
	{:else}
		<Card.Content class="flex flex-col items-center justify-center py-8 text-center space-y-2">
			<p class="text-muted-foreground font-medium">背景遮罩层已禁用</p>
			<p class="text-muted-foreground text-sm">启用上方开关以使用背景遮罩层效果</p>
		</Card.Content>
	{/if}
</Card.Root>

<!-- 上层遮罩层 -->
<Card.Root>
	<Card.Header>
		<Card.Title>上层遮罩层</Card.Title>
		<Card.Description>在所有内容上方添加颜色遮罩和滤镜效果</Card.Description>
		<Card.Action>
			<Switch bind:checked={$currentSettings.background.global.topOverlay.enabled} />
		</Card.Action>
	</Card.Header>
	<Separator />
	{#if $currentSettings.background.global.topOverlay.enabled}
		<Card.Content class="space-y-4">
			<!-- 遮罩颜色 -->
			<Card.ContentItem label="遮罩颜色" description="选择遮罩层的颜色">
				<Input
					type="color"
					bind:value={$currentSettings.background.global.topOverlay.color}
					class="h-10 w-20"
				/>
				<span class="text-muted-foreground ml-4 font-mono text-sm">
					{$currentSettings.background.global.topOverlay.color.toUpperCase()}
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.color = '#000000')}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 遮罩透明度 -->
			<Card.ContentItem label="遮罩透明度" description="调整遮罩层透明度: 0~100%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.opacity}
					min={0}
					max={1}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.topOverlay.opacity * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.opacity = 0.1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 亮度 -->
			<Card.ContentItem label="亮度" description="调整亮度: 0~200%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.filters.brightness}
					min={0}
					max={2}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.topOverlay.filters.brightness * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.filters.brightness = 1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 对比度 -->
			<Card.ContentItem label="对比度" description="调整对比度: 0~200%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.filters.contrast}
					min={0}
					max={2}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.topOverlay.filters.contrast * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.filters.contrast = 1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 饱和度 -->
			<Card.ContentItem label="饱和度" description="调整饱和度: 0~2">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.filters.saturate}
					min={0}
					max={2}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.topOverlay.filters.saturate * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.filters.saturate = 1)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 模糊 -->
			<Card.ContentItem label="模糊" description="调整模糊程度: 0~20px">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.filters.blur}
					min={0}
					max={20}
					step={0.1}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{$currentSettings.background.global.topOverlay.filters.blur.toFixed(1)}px
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.filters.blur = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
			<!-- 灰度 -->
			<Card.ContentItem label="灰度" description="调整灰度程度: 0~100%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.filters.grayscale}
					min={0}
					max={1}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.topOverlay.filters.grayscale * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.filters.grayscale = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>

			<!-- 色相旋转 -->
			<Card.ContentItem label="色相旋转" description="调整色相旋转角度: 0~360°">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.filters.hueRotate}
					min={0}
					max={360}
					step={1}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.topOverlay.filters.hueRotate)}°
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.filters.hueRotate = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>

			<!-- 反转 -->
			<Card.ContentItem label="反转" description="调整反转程度: 0~100%">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.background.global.topOverlay.filters.invert}
					min={0}
					max={1}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.background.global.topOverlay.filters.invert * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => ($currentSettings.background.global.topOverlay.filters.invert = 0)}
				>
					<RotateCcw />
				</Button>
			</Card.ContentItem>
		</Card.Content>
	{:else}
		<Card.Content class="flex flex-col items-center justify-center py-8 text-center space-y-2">
			<p class="text-muted-foreground font-medium">上层遮罩层已禁用</p>
			<p class="text-muted-foreground text-sm">启用上方开关以使用上层遮罩层效果</p>
		</Card.Content>
	{/if}
</Card.Root>
