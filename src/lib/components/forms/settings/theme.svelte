<script lang="ts">
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { mode, resetMode, setMode } from 'mode-watcher';
	import {
		ALL_Std_TD_NAMES,
		AppThemeMode2Str,
		AppThemeType2Str,
		DefaultThemeData,
		PonyNameEnum,
		type AppThemeMode,
		type AppThemeType
	} from '$lib/settings/Theme';
	import { Label } from '$lib/components/ui/label';
	import { applyFourColorsHue, applyThemeType } from '$lib/theme/themeUtils';
	import ThemePreview from '$lib/components/theme/ThemePreview.svelte';
	import * as Card from '$lib/components/ui/card';
	import { ButtonList } from '$lib/components/ui/button-list';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { updateName } from '$lib/theme/standard';
	import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';

	const currentSettings = inject(USER_SETTINGS);

	$effect(() => {
		applyFourColorsHue($currentSettings.theme.data.four_colors.hue);
	});

	function handleThemeType(theme: AppThemeType) {
		$currentSettings.theme.type = theme;
		applyThemeType(theme);
	}

	function handleThemeMode(mode: AppThemeMode) {
		$currentSettings.theme.mode = mode;
		if (mode === 'system') resetMode();
		else setMode(mode);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>主题模式</Card.Title>
		<Card.Description>选择应用程序的主题模式</Card.Description>
	</Card.Header>
	<Card.Content>
		<ButtonList Map2Str={AppThemeMode2Str} selected={mode.current} onclick={handleThemeMode}
		></ButtonList>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>主题类型</Card.Title>
		<Card.Description>选择主题的配色方案</Card.Description>
	</Card.Header>
	<Card.Content>
		<ButtonList
			Map2Str={AppThemeType2Str}
			selected={$currentSettings.theme.type}
			onclick={handleThemeType}
		></ButtonList>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>主题配置</Card.Title>
		<!-- <Card.Description>配置主题 调整四色主题的色相值</Card.Description> -->
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if $currentSettings.theme.type === 'four_colors'}
			<Card.ContentItem label="色相值" description="0~360，每一个色相都是一个不同的主题">
				<SliderWithControls
					bind:value={$currentSettings.theme.data.four_colors.hue}
					defaultValue={DefaultThemeData.four_colors.hue}
					min={0}
					max={360}
					step={1}
				>
					{#snippet valueLabel()}
						<Input
							bind:value={$currentSettings.theme.data.four_colors.hue}
							type="number"
							placeholder="Hue"
						/>
					{/snippet}
				</SliderWithControls>
			</Card.ContentItem>
		{:else if $currentSettings.theme.type === 'standard'}
			<!-- <Label>当前主题无配置项</Label> -->
			{#each ALL_Std_TD_NAMES as std_theme_name}
				<div class="flex gap-2 space-y-2">
					<Button
						variant={$currentSettings.theme.data.standard.name === std_theme_name
							? 'default'
							: 'outline'}
						onclick={() => {
							updateName(std_theme_name);
							$currentSettings.theme.data.standard.name = std_theme_name;
						}}
						>{std_theme_name}
					</Button>
				</div>
			{/each}
		{:else if $currentSettings.theme.type === 'pony'}
			<div>
				{#each Object.keys(PonyNameEnum) as name}
					<Button
						variant={$currentSettings.theme.data?.pony?.name === name ? 'default' : 'outline'}
						size="sm"
						onclick={() => console.log('try to set theme Pony', name)}
					>
						{name}
					</Button>
				{/each}
			</div>
		{:else}
			<div>
				<Label>当前主题无配置项: {$currentSettings.theme}</Label>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<!-- 主题预览 -->
<ThemePreview themeType={$currentSettings.theme.type} />
