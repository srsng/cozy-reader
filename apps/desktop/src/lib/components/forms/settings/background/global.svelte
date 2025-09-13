<script lang="ts" module>
	import { inject } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import {
		DisplayModeOptions,
		BackgroundPositionOptions,
		BlendModeOptions,
		DEFAULT_LIGHT_OPACITY,
		DEFAULT_DARK_OPACITY,
		DEFAULT_ANIMATION_DURATION
	} from '$lib/settings/background';

	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import { Separator } from '$ui/separator';
	import { RotateCcw } from 'lucide-svelte';
	import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
</script>

<script lang="ts">
	const currentSettings = $state(inject(USER_SETTINGS));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>全局配置</Card.Title>
		<Card.Description>适用于所有背景图片的通用设置</Card.Description>
	</Card.Header>
	<Separator />
	<Card.Content class="space-y-4">
		<!-- 透明度 -->
		<div class="space-y-3">
			<Label class="text-base font-medium">透明度设置</Label>

			<!-- 亮色模式透明度 -->
			<Card.ContentItem label="亮色模式透明度" description="调整亮色主题下的背景透明度: 0~100%">
				<SliderWithControls
					bind:value={$currentSettings.background.global.opacity.light}
					defaultValue={DEFAULT_LIGHT_OPACITY}
					min={0}
					max={1}
					step={0.01}
				>
					{#snippet valueLabel()}
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{Math.round($currentSettings.background.global.opacity.light * 100)}%
						</span>
					{/snippet}
				</SliderWithControls>
			</Card.ContentItem>

			<!-- 暗色模式透明度 -->
			<Card.ContentItem label="暗色模式透明度" description="调整暗色主题下的背景透明度: 0~100%">
				<SliderWithControls
					bind:value={$currentSettings.background.global.opacity.dark}
					defaultValue={DEFAULT_DARK_OPACITY}
					min={0}
					max={1}
					step={0.01}
				>
					{#snippet valueLabel()}
						<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
							{Math.round($currentSettings.background.global.opacity.dark * 100)}%
						</span>
					{/snippet}
				</SliderWithControls>
			</Card.ContentItem>
		</div>

		<!-- 动画时长 -->
		<Card.ContentItem label="切换动画时长" description="背景切换动画时长: 0~2s">
			<SliderWithControls
				bind:value={$currentSettings.background.global.animationDuration}
				defaultValue={DEFAULT_ANIMATION_DURATION}
				min={0}
				max={2000}
				step={50}
			>
				{#snippet valueLabel()}
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{$currentSettings.background.global.animationDuration / 1000}s
					</span>
				{/snippet}
			</SliderWithControls>
		</Card.ContentItem>

		<!-- 显示模式 -->
		<Card.ContentItem label="显示模式" description="选择背景图片的显示模式">
			<Select.Root type="single" bind:value={$currentSettings.background.global.displayMode}>
				<Select.Trigger>
					{DisplayModeOptions.find(
						(option) => option.value === $currentSettings.background.global.displayMode
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
					$currentSettings.background.global.displayMode = 'cover';
				}}
			>
				<RotateCcw />
			</Button>
		</Card.ContentItem>

		<!-- 位置 -->
		<Card.ContentItem label="位置" description="选择背景图片的显示位置">
			<Select.Root type="single" bind:value={$currentSettings.background.global.position}>
				<Select.Trigger>
					{BackgroundPositionOptions.find(
						(option) => option.value === $currentSettings.background.global.position
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
					$currentSettings.background.global.position = 'center';
				}}
			>
				<RotateCcw />
			</Button>
		</Card.ContentItem>

		<!-- 混合模式 -->
		<Card.ContentItem label="混合模式" description="选择背景图片的混合模式">
			<Select.Root type="single" bind:value={$currentSettings.background.global.blendMode}>
				<Select.Trigger>
					{BlendModeOptions.find(
						(option) => option.value === $currentSettings.background.global.blendMode
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
					$currentSettings.background.global.blendMode = 'normal';
				}}
			>
				<RotateCcw />
			</Button>
		</Card.ContentItem>
		<Separator />

		<!-- 全局滤镜 -->
		<div class="space-y-2">
			<Label class="text-base font-medium">全局滤镜</Label>
			<div class="border-muted space-y-2">
				<!-- 亮度 -->
				<Card.ContentItem label="亮度" description="调整亮度: 0~200%">
					<SliderWithControls
						bind:value={$currentSettings.background.global.filters.brightness}
						defaultValue={1}
						min={0}
						max={2}
						step={0.01}
					>
						{#snippet valueLabel()}
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round($currentSettings.background.global.filters.brightness * 100)}%
							</span>
						{/snippet}
					</SliderWithControls>
				</Card.ContentItem>

				<!-- 对比度 -->
				<Card.ContentItem label="对比度" description="调整对比度: 0~2">
					<SliderWithControls
						bind:value={$currentSettings.background.global.filters.contrast}
						defaultValue={1}
						min={0}
						max={2}
						step={0.01}
					>
						{#snippet valueLabel()}
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round($currentSettings.background.global.filters.contrast * 100)}%
							</span>
						{/snippet}
					</SliderWithControls>
				</Card.ContentItem>

				<!-- 饱和度 -->
				<Card.ContentItem label="饱和度" description="调整饱和度: 0~2">
					<SliderWithControls
						bind:value={$currentSettings.background.global.filters.saturate}
						defaultValue={1}
						min={0}
						max={2}
						step={0.01}
					>
						{#snippet valueLabel()}
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round($currentSettings.background.global.filters.saturate * 100)}%
							</span>
						{/snippet}
					</SliderWithControls>
				</Card.ContentItem>

				<!-- 模糊 -->
				<Card.ContentItem label="模糊" description="调整模糊程度: 0~20px">
					<SliderWithControls
						bind:value={$currentSettings.background.global.filters.blur}
						defaultValue={0}
						min={0}
						max={20}
						step={0.1}
					>
						{#snippet valueLabel()}
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{$currentSettings.background.global.filters.blur.toFixed(1)}px
							</span>
						{/snippet}
					</SliderWithControls>
				</Card.ContentItem>

				<!-- 灰度 -->
				<Card.ContentItem label="灰度" description="调整灰度程度: 0~100%">
					<SliderWithControls
						bind:value={$currentSettings.background.global.filters.grayscale}
						defaultValue={0}
						min={0}
						max={1}
						step={0.01}
					>
						{#snippet valueLabel()}
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round($currentSettings.background.global.filters.grayscale * 100)}%
							</span>
						{/snippet}
					</SliderWithControls>
				</Card.ContentItem>

				<!-- 色相旋转 -->
				<Card.ContentItem label="色相旋转" description="调整色相角度: 0~360°">
					<SliderWithControls
						bind:value={$currentSettings.background.global.filters.hueRotate}
						defaultValue={0}
						min={0}
						max={360}
						step={1}
					>
						{#snippet valueLabel()}
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round($currentSettings.background.global.filters.hueRotate)}°
							</span>
						{/snippet}
					</SliderWithControls>
				</Card.ContentItem>

				<!-- 反转 -->
				<Card.ContentItem label="反转" description="调整反转程度: 0~100%">
					<SliderWithControls
						bind:value={$currentSettings.background.global.filters.invert}
						defaultValue={0}
						min={0}
						max={1}
						step={0.01}
					>
						{#snippet valueLabel()}
							<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
								{Math.round($currentSettings.background.global.filters.invert * 100)}%
							</span>
						{/snippet}
					</SliderWithControls>
				</Card.ContentItem>
			</div>
		</div>
	</Card.Content>
</Card.Root>
