<script lang="ts">
	import { inject } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';

	import {
		DisplayModeOptions,
		BackgroundPositionOptions,
		BlendModeOptions,
		resetImageToDefaults,
		enableImageCustomConfig,
		DEFAULT_LIGHT_OPACITY,
		DEFAULT_DARK_OPACITY
	} from '$lib/settings/background';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import * as Select from '$lib/components/ui/select';
	import { RotateCcw } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';

	const currentSettings = $state(inject(USER_SETTINGS));

	// 获取当前激活的背景图片索引
	const activeImageIndex = $derived(
		$currentSettings.background.images.findIndex(
			(img) => img.id === $currentSettings.background.activeImageId
		)
	);

	// 重置图片配置
	function resetImageConfig(imageId: string) {
		const imageIndex = $currentSettings.background.images.findIndex((img) => img.id === imageId);
		if (imageIndex !== -1) {
			$currentSettings.background.images[imageIndex] = resetImageToDefaults(
				$currentSettings.background.images[imageIndex]
			);
		}
	}
</script>

{#if activeImageIndex >= 0 && !$currentSettings.background.images[activeImageIndex].internal}
	<Card.Root>
		<Card.Header>
			<Card.Title>图片独立配置</Card.Title>
			<Card.Description class="min-w-0 overflow-hidden">
				<div class="space-y-1">
					<p class="line-clamp-2 break-all font-medium">
						名称：{$currentSettings.background.images[activeImageIndex].name}
					</p>
					<p class="text-muted-foreground line-clamp-2 break-all text-xs">
						路径：{$currentSettings.background.images[activeImageIndex].filePath}
					</p>
				</div>
			</Card.Description>
			<Card.Action>
				<div class="flex items-center gap-2">
					<Switch
						checked={$currentSettings.background.images[activeImageIndex].enableConfig}
						onCheckedChange={(checked) => {
							if (checked) {
								$currentSettings.background.images[activeImageIndex] = enableImageCustomConfig(
									$currentSettings.background.images[activeImageIndex]
								);
							} else {
								$currentSettings.background.images[activeImageIndex].enableConfig = false;
							}
						}}
					/>
					<Button
						variant="outline"
						size="icon"
						onclick={() =>
							resetImageConfig($currentSettings.background.images[activeImageIndex].id)}
					>
						<RotateCcw />
					</Button>
				</div>
			</Card.Action>
		</Card.Header>
		<Separator />

		<Card.Content class="space-y-4">
			{#if $currentSettings.background.images[activeImageIndex].enableConfig && $currentSettings.background.images[activeImageIndex].config}
				<!-- 透明度 -->
				<!-- 透明度设置 -->
				<div class="space-y-3">
					<Label class="text-base font-medium">透明度设置</Label>

					<!-- 亮色模式透明度 -->
					<Card.ContentItem label="亮色模式透明度" description="调整亮色主题下的图片透明度: 0~100%">
						<Slider
							type="single"
							class="flex-1"
							bind:value={$currentSettings.background.images[activeImageIndex].config.opacity.light}
							min={0}
							max={1}
							step={0.01}
						/>
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{Math.round(
								$currentSettings.background.images[activeImageIndex].config.opacity.light * 100
							)}%
						</span>
						<Button
							variant="outline"
							size="icon"
							onclick={() => {
								if ($currentSettings.background.images[activeImageIndex]?.config) {
									$currentSettings.background.images[activeImageIndex].config.opacity.light =
										DEFAULT_LIGHT_OPACITY;
								}
							}}
						>
							<RotateCcw />
						</Button>
					</Card.ContentItem>

					<!-- 暗色模式透明度 -->
					<Card.ContentItem label="暗色模式透明度" description="调整暗色主题下的图片透明度: 0~100%">
						<Slider
							type="single"
							class="flex-1"
							bind:value={$currentSettings.background.images[activeImageIndex].config.opacity.dark}
							min={0}
							max={1}
							step={0.01}
						/>
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{Math.round(
								$currentSettings.background.images[activeImageIndex].config.opacity.dark * 100
							)}%
						</span>
						<Button
							variant="outline"
							size="icon"
							onclick={() => {
								if ($currentSettings.background.images[activeImageIndex]?.config) {
									$currentSettings.background.images[activeImageIndex].config.opacity.dark =
										DEFAULT_DARK_OPACITY;
								}
							}}
						>
							<RotateCcw />
						</Button>
					</Card.ContentItem>
				</div>
				<!-- 显示模式 -->
				<Card.ContentItem label="显示模式" description="选择背景图片的显示模式">
					<Select.Root
						type="single"
						bind:value={$currentSettings.background.images[activeImageIndex].config.displayMode}
					>
						<Select.Trigger>
							{DisplayModeOptions.find(
								(option) =>
									option.value ===
									$currentSettings.background.images[activeImageIndex].config!.displayMode
							)?.label || '选择显示模式'}
						</Select.Trigger>
						<Select.Content>
							{#each DisplayModeOptions as option}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Button
						variant="outline"
						size="icon"
						onclick={() => {
							if ($currentSettings.background.images[activeImageIndex]?.config) {
								$currentSettings.background.images[activeImageIndex].config.displayMode = 'cover';
							}
						}}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 位置 -->
				<Card.ContentItem label="位置" description="选择背景图片的显示位置">
					<Select.Root
						type="single"
						bind:value={$currentSettings.background.images[activeImageIndex].config.position}
					>
						<Select.Trigger>
							{BackgroundPositionOptions.find(
								(option) =>
									option.value ===
									$currentSettings.background.images[activeImageIndex].config!.position
							)?.label || '选择位置'}
						</Select.Trigger>
						<Select.Content>
							{#each BackgroundPositionOptions as option}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Button
						variant="outline"
						size="icon"
						onclick={() => {
							if ($currentSettings.background.images[activeImageIndex]?.config) {
								$currentSettings.background.images[activeImageIndex].config.position = 'center';
							}
						}}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 混合模式 -->
				<Card.ContentItem label="混合模式" description="选择背景图片的混合模式">
					<Select.Root
						type="single"
						bind:value={$currentSettings.background.images[activeImageIndex].config.blendMode}
					>
						<Select.Trigger>
							{BlendModeOptions.find(
								(option) =>
									option.value ===
									$currentSettings.background.images[activeImageIndex].config!.blendMode
							)?.label || '选择混合模式'}
						</Select.Trigger>
						<Select.Content>
							{#each BlendModeOptions as option}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Button
						variant="outline"
						size="icon"
						onclick={() => {
							if ($currentSettings.background.images[activeImageIndex]?.config) {
								$currentSettings.background.images[activeImageIndex].config.blendMode = 'normal';
							}
						}}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<Separator />

				<!-- 滤镜效果 -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<Label class="text-lg">滤镜效果</Label>
						<Switch
							checked={$currentSettings.background.images[activeImageIndex].config?.filters !==
								undefined}
							onCheckedChange={(checked) => {
								if (checked) {
									// 开启滤镜，只有在filters为空时才创建默认值
									if (!$currentSettings.background.images[activeImageIndex].config!.filters) {
										$currentSettings.background.images[activeImageIndex].config!.filters = {
											brightness: 1,
											contrast: 1,
											saturate: 1,
											blur: 0,
											grayscale: 0,
											hueRotate: 0,
											invert: 0
										};
									}
								} else {
									// 关闭滤镜，移除filters字段值
									$currentSettings.background.images[activeImageIndex].config!.filters = undefined;
								}
							}}
						/>
					</div>

					{#if $currentSettings.background.images[activeImageIndex].config?.filters !== undefined}
						<!-- 亮度 -->
						<Card.ContentItem label="亮度" description="调整亮度: 0~200%">
							<Slider
								type="single"
								class="flex-1"
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.filters.brightness
								}
								min={0}
								max={2}
								step={0.1}
							/>
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{$currentSettings.background.images[
									activeImageIndex
								].config.filters.brightness.toFixed(1)}
							</span>
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									$currentSettings.background.images[activeImageIndex].config!.filters!.brightness =
										1;
								}}
							>
								<RotateCcw />
							</Button>
						</Card.ContentItem>

						<!-- 对比度 -->
						<Card.ContentItem label="对比度" description="调整对比度: 0~200%">
							<Slider
								type="single"
								class="flex-1"
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.filters.contrast
								}
								min={0}
								max={2}
								step={0.1}
							/>
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{$currentSettings.background.images[
									activeImageIndex
								].config.filters.contrast.toFixed(1)}
							</span>
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									$currentSettings.background.images[activeImageIndex].config!.filters!.contrast =
										1;
								}}
							>
								<RotateCcw />
							</Button>
						</Card.ContentItem>

						<!-- 饱和度 -->
						<Card.ContentItem label="饱和度" description="调整饱和度: 0~200%">
							<Slider
								type="single"
								class="flex-1"
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.filters.saturate
								}
								min={0}
								max={2}
								step={0.1}
							/>
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{$currentSettings.background.images[
									activeImageIndex
								].config.filters.saturate.toFixed(1)}
							</span>
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									$currentSettings.background.images[activeImageIndex].config!.filters!.saturate =
										1;
								}}
							>
								<RotateCcw />
							</Button>
						</Card.ContentItem>

						<!-- 模糊 -->
						<Card.ContentItem label="模糊" description="调整模糊程度: 0~20px">
							<Slider
								type="single"
								class="flex-1"
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.filters.blur
								}
								min={0}
								max={20}
								step={0.5}
							/>
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{$currentSettings.background.images[activeImageIndex].config.filters.blur.toFixed(
									1
								)}px
							</span>
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									$currentSettings.background.images[activeImageIndex].config!.filters!.blur = 0;
								}}
							>
								<RotateCcw />
							</Button>
						</Card.ContentItem>

						<!-- 灰度 -->
						<Card.ContentItem label="灰度" description="调整灰度: 0~100%">
							<Slider
								type="single"
								class="flex-1"
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.filters.grayscale
								}
								min={0}
								max={1}
								step={0.01}
							/>
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round(
									$currentSettings.background.images[activeImageIndex].config.filters.grayscale *
										100
								)}%
							</span>
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									$currentSettings.background.images[activeImageIndex].config!.filters!.grayscale =
										0;
								}}
							>
								<RotateCcw />
							</Button>
						</Card.ContentItem>

						<!-- 色相旋转 -->
						<Card.ContentItem label="色相旋转" description="调整色相旋转: 0~360°">
							<Slider
								type="single"
								class="flex-1"
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.filters.hueRotate
								}
								min={0}
								max={360}
								step={1}
							/>
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round(
									$currentSettings.background.images[activeImageIndex].config!.filters!.hueRotate
								)}°
							</span>
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									if ($currentSettings.background.images[activeImageIndex]?.config?.filters) {
										$currentSettings.background.images[activeImageIndex].config.filters.hueRotate =
											0;
									}
								}}
							>
								<RotateCcw />
							</Button>
						</Card.ContentItem>

						<!-- 反转 -->
						<Card.ContentItem label="反转" description="调整反转程度: 0~100%">
							<Slider
								type="single"
								class="flex-1"
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.filters.invert
								}
								min={0}
								max={1}
								step={0.01}
							/>
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round(
									$currentSettings.background.images[activeImageIndex].config!.filters!.invert * 100
								)}%
							</span>
							<Button
								variant="outline"
								size="icon"
								onclick={() => {
									$currentSettings.background.images[activeImageIndex].config!.filters!.invert = 0;
								}}
							>
								<RotateCcw />
							</Button>
						</Card.ContentItem>
					{/if}
				</div>
				<Separator />

				<!-- 变换设置 -->
				<div class="space-y-4">
					<Label class="text-lg">变换设置</Label>

					<!-- 缩放 -->
					<Card.ContentItem label="缩放" description="调整图片缩放比例: 10%~500%">
						<Slider
							type="single"
							class="flex-1"
							bind:value={$currentSettings.background.images[activeImageIndex].config.scale}
							min={0.1}
							max={5.0}
							step={0.1}
						/>
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{Math.round($currentSettings.background.images[activeImageIndex].config.scale * 100)}%
						</span>
						<Button
							variant="outline"
							size="icon"
							onclick={() => {
								if ($currentSettings.background.images[activeImageIndex]?.config) {
									$currentSettings.background.images[activeImageIndex].config.scale = 1.0;
								}
							}}
						>
							<RotateCcw />
						</Button>
					</Card.ContentItem>

					<!-- 旋转 -->
					<Card.ContentItem label="旋转" description="调整图片旋转角度: 0~360°">
						<Slider
							type="single"
							class="flex-1"
							bind:value={$currentSettings.background.images[activeImageIndex].config.rotation}
							min={0}
							max={360}
							step={1}
						/>
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{Math.round($currentSettings.background.images[activeImageIndex].config.rotation)}°
						</span>
						<Button
							variant="outline"
							size="icon"
							onclick={() => {
								if ($currentSettings.background.images[activeImageIndex]?.config) {
									$currentSettings.background.images[activeImageIndex].config.rotation = 0;
								}
							}}
						>
							<RotateCcw />
						</Button>
					</Card.ContentItem>

					<!-- X轴偏移 -->
					<Card.ContentItem label="X轴偏移" description="调整图片水平偏移: -1000~1000px">
						<Slider
							type="single"
							class="flex-1"
							bind:value={$currentSettings.background.images[activeImageIndex].config.offsetX}
							min={-1000}
							max={1000}
							step={10}
						/>
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{$currentSettings.background.images[activeImageIndex].config.offsetX}px
						</span>
						<Button
							variant="outline"
							size="icon"
							onclick={() => {
								if ($currentSettings.background.images[activeImageIndex]?.config) {
									$currentSettings.background.images[activeImageIndex].config.offsetX = 0;
								}
							}}
						>
							<RotateCcw />
						</Button>
					</Card.ContentItem>

					<!-- Y轴偏移 -->
					<Card.ContentItem label="Y轴偏移" description="调整图片垂直偏移: -1000~1000px">
						<Slider
							type="single"
							class="flex-1"
							bind:value={$currentSettings.background.images[activeImageIndex].config.offsetY}
							min={-1000}
							max={1000}
							step={10}
						/>
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{$currentSettings.background.images[activeImageIndex].config.offsetY}px
						</span>
						<Button
							variant="outline"
							size="icon"
							onclick={() => {
								if ($currentSettings.background.images[activeImageIndex]?.config) {
									$currentSettings.background.images[activeImageIndex].config.offsetY = 0;
								}
							}}
						>
							<RotateCcw />
						</Button>
					</Card.ContentItem>
				</div>
			{:else}
				<div class="text-muted-foreground py-8 text-center">
					<p>自定义独立配置已禁用</p>
					<p class="text-sm">启用上方开关以使用自定义配置，否则将使用全局设置</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root>
		<Card.Content class="py-8">
			<div class="text-muted-foreground text-center">
				<p>请先选择一张背景图片</p>
				<p class="text-sm">在左侧图片管理中添加并激活一张图片后，即可进行自定义配置</p>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
