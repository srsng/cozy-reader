<script lang="ts">
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { resetMode, setMode } from 'mode-watcher';
	import {
		AppThemeMode2Str,
		AppThemeType2Str,
		type AppThemeMode,
		type AppThemeType
	} from '$lib/settings/Theme';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { applyFourColorsHue, applyTheme } from '$lib/theme/themeUtils';
	import ThemePreview from '$lib/components/theme/ThemePreview.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { ButtonList } from '$lib/components/ui/button-list';
	import { Input } from '$lib/components/ui/input';

	const currentSettings = inject(USER_SETTINGS);

	$effect(() => {
		applyFourColorsHue($currentSettings.theme.data.four_colors.hue);
	});

	function handleThemeType(theme: AppThemeType) {
		$currentSettings.theme.type = theme;
		applyTheme(theme);
	}

	function handleThemeMode(mode: AppThemeMode) {
		$currentSettings.theme.mode = mode;
		if (mode === 'system') resetMode();
		else setMode(mode);
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>主题模式</CardTitle>
		<CardDescription>选择应用程序的主题模式</CardDescription>
	</CardHeader>
	<CardContent>
		<ButtonList
			Map2Str={AppThemeMode2Str}
			selected={$currentSettings.theme.mode}
			onclick={handleThemeMode}
		></ButtonList>
	</CardContent>
</Card>

<Card>
	<CardHeader>
		<CardTitle>主题类型</CardTitle>
		<CardDescription>选择主题的配色方案</CardDescription>
	</CardHeader>
	<CardContent>
		<ButtonList
			Map2Str={AppThemeType2Str}
			selected={$currentSettings.theme.type}
			onclick={handleThemeType}
		></ButtonList>
	</CardContent>
</Card>

<Card>
	<CardHeader>
		<CardTitle>主题配置</CardTitle>
		<!-- <CardDescription>配置主题 调整四色主题的色相值</CardDescription> -->
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-2">
			{#if $currentSettings.theme.type === 'four_colors'}
				<Label>色相值: {$currentSettings.theme.data.four_colors.hue}</Label>
				<Slider
					type="single"
					bind:value={$currentSettings.theme.data.four_colors.hue}
					min={0}
					max={360}
					step={1}
				/>
				<Input
					bind:value={$currentSettings.theme.data.four_colors.hue}
					type="number"
					placeholder="Hue"
				/>
			{:else if $currentSettings.theme.type === 'standard'}
				<Label>当前主题无配置项</Label>
			{:else}
				<Label>当前主题无配置项: {$currentSettings.theme}</Label>
			{/if}
		</div>
	</CardContent>
</Card>

<!-- 主题预览 -->
<ThemePreview themeType={$currentSettings.theme.type} />
