<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { SETTINGS, type Settings } from '$lib/settings';
	import { getContextStoreBySymbol } from '$lib/utils/context';
	import { resetMode, setMode } from 'mode-watcher';
	import type { AppThemeMode, AppThemeType } from '$lib/settings/Theme';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { applyFourColorsHue, applyTheme } from '$lib/theme/themeUtils';
	import ThemePreview from '$lib/components/theme/ThemePreview.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	const currentSettings = getContextStoreBySymbol<Settings, Writable<Settings>>(SETTINGS);

	$effect(() => {
		applyFourColorsHue($currentSettings.theme.data.four_colors.hue);
	});
</script>

<!-- 主题设置标签页 -->
<!-- 即时应用，自动保存 -->
<Tabs.Content value="theme" class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>主题模式</CardTitle>
			<CardDescription>选择应用程序的主题模式</CardDescription>
		</CardHeader>
		<CardContent>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="w-full justify-between">
					主题模式 - {$currentSettings.theme.mode}
				</DropdownMenu.Trigger>
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
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>主题类型</CardTitle>
			<CardDescription>选择主题的配色方案</CardDescription>
		</CardHeader>
		<CardContent>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="w-full justify-between">
					主题类型 - {$currentSettings.theme.type}
				</DropdownMenu.Trigger>
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
		</CardContent>
	</Card>

	{#if $currentSettings.theme.type === 'four_colors'}
		<Card>
			<CardHeader>
				<CardTitle>四色主题设置</CardTitle>
				<CardDescription>调整四色主题的色相值</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label>色相值: {$currentSettings.theme.data.four_colors.hue}</Label>
					<Slider
						type="single"
						bind:value={$currentSettings.theme.data.four_colors.hue}
						min={0}
						max={360}
						step={1}
					/>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- 主题预览 -->
	<ThemePreview themeType={$currentSettings.theme.type} />
</Tabs.Content>
