<script lang="ts" module>
	import { inject } from '$lib/utils/context';
	import { USER_SETTINGS } from '$lib/stores/userSettings';

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Separator } from '$lib/components/ui/separator';
	import { RotateCcw } from 'lucide-svelte';
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
		<Card.ContentItem label="透明度" description="调整背景透明度: 0~100%">
			<Slider
				type="single"
				class="flex-1"
				bind:value={$currentSettings.background.global.opacity}
				min={0}
				max={1}
				step={0.01}
			/>
			<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
				{Math.round($currentSettings.background.global.opacity * 100)}%
			</span>
			<Button
				variant="outline"
				size="icon"
				onclick={() => {
					$currentSettings.background.global.opacity = 1;
				}}
			>
				<RotateCcw />
			</Button>
		</Card.ContentItem>

		<!-- 动画时长 -->
		<Card.ContentItem label="切换动画时长" description="背景切换动画时长: 0~2s">
			<Slider
				type="single"
				class="flex-1"
				bind:value={$currentSettings.background.global.animationDuration}
				min={0}
				max={2000}
				step={50}
			/>
			<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
				{$currentSettings.background.global.animationDuration / 1000}s
			</span>
			<Button
				variant="outline"
				size="icon"
				onclick={() => {
					$currentSettings.background.global.animationDuration = 300;
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
					<Slider
						type="single"
						class="flex-1"
						bind:value={$currentSettings.background.global.filters.brightness}
						min={0}
						max={2}
						step={0.01}
					/>
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{Math.round($currentSettings.background.global.filters.brightness * 100)}%
					</span>
					<Button
						variant="outline"
						size="icon"
						onclick={() => {
							$currentSettings.background.global.filters.brightness = 1;
						}}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 对比度 -->
				<Card.ContentItem label="对比度" description="调整对比度: 0~2">
					<Slider
						type="single"
						class="flex-1"
						bind:value={$currentSettings.background.global.filters.contrast}
						min={0}
						max={2}
						step={0.01}
					/>
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{Math.round($currentSettings.background.global.filters.contrast * 100)}%
					</span>
					<Button
						variant="outline"
						size="icon"
						onclick={() => {
							$currentSettings.background.global.filters.contrast = 1;
						}}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 饱和度 -->
				<Card.ContentItem label="饱和度" description="调整饱和度: 0~2">
					<Slider
						type="single"
						class="flex-1"
						bind:value={$currentSettings.background.global.filters.saturate}
						min={0}
						max={2}
						step={0.01}
					/>
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{Math.round($currentSettings.background.global.filters.saturate * 100)}%
					</span>
					<Button
						variant="outline"
						size="icon"
						onclick={() => ($currentSettings.background.global.filters.saturate = 1)}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 模糊 -->
				<Card.ContentItem label="模糊" description="调整模糊程度: 0~20px">
					<Slider
						type="single"
						class="flex-1"
						bind:value={$currentSettings.background.global.filters.blur}
						min={0}
						max={20}
						step={0.1}
					/>
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{$currentSettings.background.global.filters.blur.toFixed(1)}px
					</span>
					<Button
						variant="outline"
						size="icon"
						onclick={() => ($currentSettings.background.global.filters.blur = 0)}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 灰度 -->
				<Card.ContentItem label="灰度" description="调整灰度程度: 0~100%">
					<Slider
						type="single"
						class="flex-1"
						bind:value={$currentSettings.background.global.filters.grayscale}
						min={0}
						max={1}
						step={0.01}
					/>
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{Math.round($currentSettings.background.global.filters.grayscale * 100)}%
					</span>
					<Button
						variant="outline"
						size="icon"
						onclick={() => ($currentSettings.background.global.filters.grayscale = 0)}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 色相旋转 -->
				<Card.ContentItem label="色相旋转" description="调整色相角度: 0~360°">
					<Slider
						type="single"
						class="flex-1"
						bind:value={$currentSettings.background.global.filters.hueRotate}
						min={0}
						max={360}
						step={1}
					/>
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{Math.round($currentSettings.background.global.filters.hueRotate)}°
					</span>
					<Button
						variant="outline"
						size="icon"
						onclick={() => ($currentSettings.background.global.filters.hueRotate = 0)}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>

				<!-- 反转 -->
				<Card.ContentItem label="反转" description="调整反转程度: 0~100%">
					<Slider
						type="single"
						class="flex-1"
						bind:value={$currentSettings.background.global.filters.invert}
						min={0}
						max={1}
						step={0.01}
					/>
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{Math.round($currentSettings.background.global.filters.invert * 100)}%
					</span>
					<Button
						variant="outline"
						size="icon"
						onclick={() => ($currentSettings.background.global.filters.invert = 0)}
					>
						<RotateCcw />
					</Button>
				</Card.ContentItem>
			</div>
		</div>
	</Card.Content>
</Card.Root>
