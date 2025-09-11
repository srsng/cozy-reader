<script lang="ts" module>
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
	import {
		AppThemeType2Str,
		type AppThemeType,
		type StandardThemeData,
		type PonyThemeData,
		type FourColorsThemeData
	} from '$lib/settings/Theme';
	import { createThemeBinding, hasThemeBinding } from '$lib/theme/themeUtils';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Select from '$lib/components/ui/select';
	import { RotateCcw, Upload } from 'lucide-svelte';
	import { askOpenImg } from '$lib/utils/file';
	import { toast } from 'svelte-sonner';
	import { Separator } from '$lib/components/ui/separator';
	import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
</script>

<script lang="ts">
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

	// 绑定当前主题到图片
	function bindCurrentTheme(imageId: string) {
		const imageIndex = $currentSettings.background.images.findIndex((img) => img.id === imageId);
		if (imageIndex !== -1) {
			const themeBinding = createThemeBinding(
				$currentSettings.theme.type,
				$currentSettings.theme.data
			);

			$currentSettings.background.images[imageIndex].themeBinding = themeBinding;
		}
	}

	// 移除主题绑定
	function removeThemeBinding(imageId: string) {
		const imageIndex = $currentSettings.background.images.findIndex((img) => img.id === imageId);
		if (imageIndex !== -1) {
			$currentSettings.background.images[imageIndex].themeBinding = undefined;
		}
	}

	// 重新选择背景图片
	async function reselectBackgroundImage(imageId: string) {
		try {
			const filePath = await askOpenImg();
			if (filePath) {
				const imageIndex = $currentSettings.background.images.findIndex(
					(img) => img.id === imageId
				);
				if (imageIndex !== -1) {
					// 更新图片路径，保持其他配置不变
					$currentSettings.background.images[imageIndex].filePath = filePath;

					toast.success('背景图片已更新', {
						description: '图片路径已更新，配置保持不变'
					});
				}
			}
		} catch (error) {
			toast.error('选择图片失败', {
				description: `${error}`
			});
			console.error('选择图片失败:', error);
		}
	}
</script>

{#key activeImageIndex}
	{#if activeImageIndex >= 0 && !$currentSettings.background.images[activeImageIndex].internal}
		<!-- 主题绑定配置 -->
		<Card.Root>
			<Card.Header>
				<Card.Title>主题绑定</Card.Title>
				<Card.Description>
					将当前图片与特定主题绑定，切换到该图片时自动应用绑定的主题
				</Card.Description>
				<Card.Action>
					{#if hasThemeBinding($currentSettings.background.images[activeImageIndex])}
						<Button
							variant="outline"
							size="icon"
							onclick={() =>
								removeThemeBinding($currentSettings.background.images[activeImageIndex].id)}
						>
							<RotateCcw />
						</Button>
					{/if}
				</Card.Action>
			</Card.Header>
			<Separator />
			<Card.Content class="space-y-4">
				{#if hasThemeBinding($currentSettings.background.images[activeImageIndex])}
					<!-- 显示已绑定的主题信息 -->
					<div class="space-y-3">
						<Label class="text-base font-medium">已绑定主题</Label>
						<div class="bg-muted rounded-lg p-4">
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-sm font-medium">主题类型:</span>
									<span class="text-sm">
										{AppThemeType2Str[
											($currentSettings.background.images[activeImageIndex].themeBinding
												?.type as AppThemeType) || $currentSettings.theme.type
										]}
									</span>
								</div>
								{#if $currentSettings.background.images[activeImageIndex].themeBinding?.type === 'four_colors'}
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium">色相值:</span>
										<span class="text-sm"
											>{(
												$currentSettings.background.images[activeImageIndex].themeBinding
													?.data as FourColorsThemeData
											)?.hue || 0}°</span
										>
									</div>
								{:else if $currentSettings.background.images[activeImageIndex].themeBinding?.type === 'standard'}
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium">主题名称:</span>
										<span class="text-sm"
											>{(
												$currentSettings.background.images[activeImageIndex].themeBinding
													?.data as StandardThemeData
											)?.name || 'default'}</span
										>
									</div>
								{:else if $currentSettings.background.images[activeImageIndex].themeBinding?.type === 'pony'}
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium">角色名称:</span>
										<span class="text-sm"
											>{(
												$currentSettings.background.images[activeImageIndex].themeBinding
													?.data as PonyThemeData
											)?.name || 'twilight_sparkle'}</span
										>
									</div>
								{/if}
							</div>
						</div>
						<Button
							variant="destructive"
							class="w-full"
							onclick={() =>
								removeThemeBinding($currentSettings.background.images[activeImageIndex].id)}
						>
							移除主题绑定
						</Button>
					</div>
				{:else}
					<!-- 绑定当前主题 -->
					<div class="space-y-3">
						<Label class="text-base font-medium">可绑定当前主题</Label>
						<div class="bg-muted rounded-lg p-4">
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-sm font-medium">当前主题类型:</span>
									<span class="text-sm">{AppThemeType2Str[$currentSettings.theme.type]}</span>
								</div>
								{#if $currentSettings.theme.type === 'four_colors'}
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium">色相值:</span>
										<span class="text-sm">{$currentSettings.theme.data.four_colors.hue}°</span>
									</div>
								{:else if $currentSettings.theme.type === 'standard'}
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium">主题名称:</span>
										<span class="text-sm">{$currentSettings.theme.data.standard.name}</span>
									</div>
								{:else if $currentSettings.theme.type === 'pony'}
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium">角色名称:</span>
										<span class="text-sm">{$currentSettings.theme.data.pony.name}</span>
									</div>
								{/if}
							</div>
						</div>
						<Button
							variant="default"
							class="w-full"
							onclick={() =>
								bindCurrentTheme($currentSettings.background.images[activeImageIndex].id)}
						>
							绑定当前主题
						</Button>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>图片独立配置</Card.Title>
				<Card.Description>优先与全局的配置，只作用于当前图片</Card.Description>
				<Card.Description class="min-w-0 overflow-hidden">
					<div class="space-y-1">
						<p class="line-clamp-2 break-all font-medium">
							名称：{$currentSettings.background.images[activeImageIndex].name}
						</p>
						<p class="text-muted-foreground line-clamp-2 break-all">
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
							title="重新选择图片"
							onclick={() =>
								reselectBackgroundImage($currentSettings.background.images[activeImageIndex].id)}
						>
							<Upload />
						</Button>
						<Button
							variant="outline"
							size="icon"
							title="重置配置"
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
				{#if $currentSettings.background.images[activeImageIndex].config && $currentSettings.background.images[activeImageIndex].enableConfig}
					<!-- 透明度 -->
					<!-- 透明度设置 -->
					<div class="space-y-3">
						<Label class="text-base font-medium">透明度设置</Label>

						<!-- 亮色模式透明度 -->
						<Card.ContentItem
							label="亮色模式透明度"
							description="调整亮色主题下的图片透明度: 0~100%"
						>
							<SliderWithControls
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.opacity.light
								}
								defaultValue={DEFAULT_LIGHT_OPACITY}
								min={0}
								max={1}
								step={0.01}
							>
								{#snippet valueLabel()}
									<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
										{Math.round(
											($currentSettings.background.images[activeImageIndex].config?.opacity
												?.light || 1) * 100
										)}%
									</span>
								{/snippet}
							</SliderWithControls>
						</Card.ContentItem>

						<!-- 暗色模式透明度 -->
						<Card.ContentItem
							label="暗色模式透明度"
							description="调整暗色主题下的图片透明度: 0~100%"
						>
							<SliderWithControls
								bind:value={
									$currentSettings.background.images[activeImageIndex].config.opacity.dark
								}
								defaultValue={DEFAULT_DARK_OPACITY}
								min={0}
								max={1}
								step={0.01}
							>
								{#snippet valueLabel()}
									<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
										{Math.round(
											($currentSettings.background.images[activeImageIndex].config?.opacity?.dark ||
												1) * 100
										)}%
									</span>
								{/snippet}
							</SliderWithControls>
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
										$currentSettings.background.images[activeImageIndex].config!.filters =
											undefined;
									}
								}}
							/>
						</div>

						{#if $currentSettings.background.images[activeImageIndex].config?.filters !== undefined}
							<!-- 亮度 -->
							<Card.ContentItem label="亮度" description="调整亮度: 0~200%">
								<SliderWithControls
									bind:value={
										$currentSettings.background.images[activeImageIndex].config.filters.brightness
									}
									defaultValue={1}
									min={0}
									max={2}
									step={0.1}
								>
									{#snippet valueLabel()}
										<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
											{(
												$currentSettings.background.images[activeImageIndex].config?.filters
													?.brightness || 1
											).toFixed(1)}
										</span>
									{/snippet}
								</SliderWithControls>
							</Card.ContentItem>

							<!-- 对比度 -->
							<Card.ContentItem label="对比度" description="调整对比度: 0~200%">
								<SliderWithControls
									bind:value={
										$currentSettings.background.images[activeImageIndex].config.filters.contrast
									}
									defaultValue={1}
									min={0}
									max={2}
									step={0.1}
								>
									{#snippet valueLabel()}
										<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
											{(
												$currentSettings.background.images[activeImageIndex].config?.filters
													?.contrast || 1
											).toFixed(1)}
										</span>
									{/snippet}
								</SliderWithControls>
							</Card.ContentItem>

							<!-- 饱和度 -->
							<Card.ContentItem label="饱和度" description="调整饱和度: 0~200%">
								<SliderWithControls
									bind:value={
										$currentSettings.background.images[activeImageIndex].config.filters.saturate
									}
									defaultValue={1}
									min={0}
									max={2}
									step={0.1}
								>
									{#snippet valueLabel()}
										<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
											{(
												$currentSettings.background.images[activeImageIndex].config?.filters
													?.saturate || 1
											).toFixed(1)}
										</span>
									{/snippet}
								</SliderWithControls>
							</Card.ContentItem>

							<!-- 模糊 -->
							<Card.ContentItem label="模糊" description="调整模糊程度: 0~20px">
								<SliderWithControls
									bind:value={
										$currentSettings.background.images[activeImageIndex].config.filters.blur
									}
									defaultValue={0}
									min={0}
									max={20}
									step={0.5}
								>
									{#snippet valueLabel()}
										<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
											{(
												$currentSettings.background.images[activeImageIndex].config?.filters
													?.blur || 0
											).toFixed(1)}px
										</span>
									{/snippet}
								</SliderWithControls>
							</Card.ContentItem>

							<!-- 灰度 -->
							<Card.ContentItem label="灰度" description="调整灰度: 0~100%">
								<SliderWithControls
									bind:value={
										$currentSettings.background.images[activeImageIndex].config.filters.grayscale
									}
									defaultValue={0}
									min={0}
									max={1}
									step={0.01}
								>
									{#snippet valueLabel()}
										<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
											{Math.round(
												($currentSettings.background.images[activeImageIndex].config?.filters
													?.grayscale || 0) * 100
											)}%
										</span>
									{/snippet}
								</SliderWithControls>
							</Card.ContentItem>

							<!-- 色相旋转 -->
							<Card.ContentItem label="色相旋转" description="调整色相旋转: 0~360°">
								<SliderWithControls
									bind:value={
										$currentSettings.background.images[activeImageIndex].config.filters.hueRotate
									}
									defaultValue={0}
									min={0}
									max={360}
									step={1}
								>
									{#snippet valueLabel()}
										<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
											{Math.round(
												$currentSettings.background.images[activeImageIndex].config?.filters
													?.hueRotate || 0
											)}°
										</span>
									{/snippet}
								</SliderWithControls>
							</Card.ContentItem>

							<!-- 反转 -->
							<Card.ContentItem label="反转" description="调整反转程度: 0~100%">
								<SliderWithControls
									bind:value={
										$currentSettings.background.images[activeImageIndex].config.filters.invert
									}
									defaultValue={0}
									min={0}
									max={1}
									step={0.01}
								>
									{#snippet valueLabel()}
										<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
											{Math.round(
												($currentSettings.background.images[activeImageIndex].config?.filters
													?.invert || 0) * 100
											)}%
										</span>
									{/snippet}
								</SliderWithControls>
							</Card.ContentItem>
						{/if}
					</div>
					<Separator />

					<!-- 变换设置 -->
					<div class="space-y-4">
						<Label class="text-lg">变换设置</Label>

						<!-- 缩放 -->
						<Card.ContentItem label="缩放" description="调整图片缩放比例: 10%~500%">
							<SliderWithControls
								bind:value={$currentSettings.background.images[activeImageIndex].config.scale}
								defaultValue={1.0}
								min={0.1}
								max={5.0}
								step={0.1}
							>
								{#snippet valueLabel()}
									<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
										{Math.round(
											($currentSettings.background.images[activeImageIndex].config?.scale || 1) *
												100
										)}%
									</span>
								{/snippet}
							</SliderWithControls>
						</Card.ContentItem>

						<!-- 旋转 -->
						<Card.ContentItem label="旋转" description="调整图片旋转角度: -360~360°">
							<SliderWithControls
								bind:value={$currentSettings.background.images[activeImageIndex].config.rotation}
								defaultValue={0}
								min={-360}
								max={360}
								step={1}
							>
								{#snippet valueLabel()}
									<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
										{Math.round(
											$currentSettings.background.images[activeImageIndex].config?.rotation || 0
										)}°
									</span>
								{/snippet}
							</SliderWithControls>
						</Card.ContentItem>

						<!-- X轴偏移 -->
						<Card.ContentItem label="X轴偏移" description="调整图片水平偏移: -1000~1000px">
							<SliderWithControls
								bind:value={$currentSettings.background.images[activeImageIndex].config.offsetX}
								defaultValue={0}
								min={-1000}
								max={1000}
								step={10}
							>
								{#snippet valueLabel()}
									<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
										{$currentSettings.background.images[activeImageIndex].config?.offsetX || 0}px
									</span>
								{/snippet}
							</SliderWithControls>
						</Card.ContentItem>

						<!-- Y轴偏移 -->
						<Card.ContentItem label="Y轴偏移" description="调整图片垂直偏移: -1000~1000px">
							<SliderWithControls
								bind:value={$currentSettings.background.images[activeImageIndex].config.offsetY}
								defaultValue={0}
								min={-1000}
								max={1000}
								step={10}
							>
								{#snippet valueLabel()}
									<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
										{$currentSettings.background.images[activeImageIndex].config?.offsetY || 0}px
									</span>
								{/snippet}
							</SliderWithControls>
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
		<!-- 主题绑定配置 -->
		<Card.Root>
			<Card.Header>
				<Card.Title>主题绑定</Card.Title>
				<Card.Description>
					将当前图片与特定主题绑定，切换到该图片时自动应用绑定的主题
				</Card.Description>
			</Card.Header>
			<Separator />
			<Card.Content class="space-y-4">
				<div class="text-muted-foreground text-center">
					<p>请先选择一张背景图片</p>
					<p class="text-sm">在左侧图片管理中添加并激活一张图片后，即可绑定主题</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>图片独立配置</Card.Title>
				<Card.Description>优先与全局的配置，只作用于当前图片</Card.Description>
			</Card.Header>
			<Card.Content class="py-8">
				<div class="text-muted-foreground text-center">
					<p>请先选择一张背景图片</p>
					<p class="text-sm">在左侧图片管理中添加并激活一张图片后，即可进行自定义配置</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
{/key}
