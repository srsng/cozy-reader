<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { SETTINGS, type Settings } from '$lib/settings';
	import { getContextStoreBySymbol } from '$lib/utils/context';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { setLocale } from '$lib/paraglide/runtime';
	import { langCode2Name, type AppLanguageCode } from '$lib/settings/Base';
	import { ButtonList } from '$lib/components/ui/button-list';

	const currentSettings = getContextStoreBySymbol<Settings, Writable<Settings>>(SETTINGS);

	// 选择语言
	function handleLanguageChange(langCode: AppLanguageCode) {
		console.log('langCode', langCode);
		$currentSettings.base.langCode = langCode;
		setLocale(langCode);
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>界面设置</CardTitle>
		<CardDescription>控制应用程序界面的显示选项</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>标题栏</Label>
				<p class="text-muted-foreground text-sm">显示应用程序标题栏</p>
			</div>
			<Switch bind:checked={$currentSettings.base.titlebar} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>页眉</Label>
				<p class="text-muted-foreground text-sm">显示页面顶部导航栏</p>
			</div>
			<Switch bind:checked={$currentSettings.base.header} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>页脚</Label>
				<p class="text-muted-foreground text-sm">显示页面底部信息栏</p>
			</div>
			<Switch bind:checked={$currentSettings.base.footer} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>始终置顶</Label>
				<p class="text-muted-foreground text-sm">窗口始终保持在最前面</p>
			</div>
			<Switch bind:checked={$currentSettings.base.alwaysOnTop} />
		</div>
	</CardContent>
</Card>

<Card>
	<CardHeader>
		<CardTitle>语言设置</CardTitle>
		<CardDescription>选择应用程序的显示语言</CardDescription>
	</CardHeader>
	<CardContent>
		<ButtonList
			Map2Str={langCode2Name}
			selected={$currentSettings.theme.mode}
			onclick={handleLanguageChange}
		></ButtonList>
	</CardContent>
</Card>

<Card>
	<CardHeader>
		<CardTitle>缩放设置</CardTitle>
		<CardDescription>调整应用程序的整体缩放比例</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-2">
			<Label>缩放比例: {$currentSettings.base.zoom * 100}%</Label>
			<Slider type="single" bind:value={$currentSettings.base.zoom} min={0.5} max={2} step={0.1} />
		</div>
	</CardContent>
</Card>
