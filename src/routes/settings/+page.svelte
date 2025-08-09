<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { resetMode, setMode } from 'mode-watcher';
	import { DEFAULT_SETTINGS, SETTINGS, type Settings } from '$lib/settings';
	import { getContextStoreBySymbol } from '$lib/utils/context';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { AppThemeMode, AppThemeType } from '$lib/settings/Theme';
	import { Separator } from '$lib/components/ui/separator';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { applyTheme, applyFourColorsHue } from '$lib/theme/themeUtils';
	import ThemePreview from '$lib/components/theme/ThemePreview.svelte';

	let saveBtnText = $state('保存设置');
	let saveBtnActivate = $state(true);
	let timer: ReturnType<typeof setTimeout>;

	const currentSettings = getContextStoreBySymbol<Settings, Writable<Settings>>(SETTINGS);
	let localSettings = $state(DEFAULT_SETTINGS);

	onMount(() => {
		localSettings = {
			...localSettings,
			...$currentSettings
		};
	});

	$effect(() => {
		// 如果是 four_colors 主题，应用色相值
		if ($currentSettings.theme.type === 'four_colors') {
			applyFourColorsHue($currentSettings.theme.data.four_colors.hue);
		}
	});

	// 单独监听色相值的变化，实现实时预览
	$effect(() => {
		if ($currentSettings.theme.type === 'four_colors') {
			applyFourColorsHue($currentSettings.theme.data.four_colors.hue);
		}
	});

	function handleSave() {
		saveBtnText = '保存中...';
		saveBtnActivate = false;
		currentSettings.update((s) => ({ ...s, ...localSettings }));
		saveBtnText = '已保存！';

		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			saveBtnText = '保存设置';
			saveBtnActivate = true;
		}, 2000);
	}
</script>

<div class="mx-auto w-full max-w-[85%] space-y-6 p-6">
	<div class="space-y-2">
		<h2 class="text-2xl font-bold">设置</h2>
		<p class="text-muted-foreground">管理应用程序的设置选项</p>
	</div>

	<section>
		<div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>主题模式 - {$currentSettings.theme.mode}</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.RadioGroup bind:value={$currentSettings.theme.mode}>
						<DropdownMenu.RadioItem value={'light' as AppThemeMode} onclick={() => setMode('light')}
							>Light</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem value={'dark' as AppThemeMode} onclick={() => setMode('dark')}
							>Dark</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem value={'system' as AppThemeMode} onclick={resetMode}
							>System</DropdownMenu.RadioItem
						>
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		<div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>主题类型 - {$currentSettings.theme.type}</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.RadioGroup bind:value={$currentSettings.theme.type}>
						<DropdownMenu.RadioItem
							value={'standard' as AppThemeType}
							onclick={() => applyTheme('standard')}>Standard</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem
							value={'four_colors' as AppThemeType}
							onclick={() => applyTheme('four_colors')}>Four colors</DropdownMenu.RadioItem
						>
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		{#if $currentSettings.theme.type === 'four_colors'}
			<div class="space-y-2">
				<Label>色相值: {$currentSettings.theme.data.four_colors.hue}</Label>
				<Slider
					type="single"
					disabled={$currentSettings.theme.type !== 'four_colors'}
					bind:value={$currentSettings.theme.data.four_colors.hue}
					min={0}
					max={360}
					step={1}
				/>
			</div>
		{/if}
	</section>

	<!-- 主题预览 -->
	<section class="space-y-4">
		<h3 class="text-lg font-medium">主题预览</h3>
		<ThemePreview themeType={$currentSettings.theme.type} />
	</section>

	<Separator />

	<!-- Save Button -->
	<div class="flex justify-end">
		<Button onclick={handleSave} disabled={!saveBtnActivate}>
			{saveBtnText}
		</Button>
	</div>

	<!-- 关于 -->
	<!-- <section class="space-y-4">
    <h3 class="text-lg font-medium">关于</h3>
    <div class="p-4 rounded-lg">
      <p class="text-sm">版本: 1.0.0</p>
      <p class="text-sm">构建日期: 2024-01-27</p>
    </div>
  </section> -->
</div>
