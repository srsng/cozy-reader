<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { SETTINGS, type Settings } from '$lib/settings';
	import { getContextStoreBySymbol } from '$lib/utils/context';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import * as Tabs from '$lib/components/ui/tabs';
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

	const currentSettings = getContextStoreBySymbol<Settings, Writable<Settings>>(SETTINGS);

	// 选择语言
	function handleLanguageChange(lang: AppLanguageCode) {
		$currentSettings.base.langCode = lang;
		setLocale(lang);
	}
</script>

<!-- 基础设置标签页 -->
<!-- 除了语言项，其他都需要保存 -->
<Tabs.Content value="base" class="space-y-6">
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

	<!-- 即时应用，自动保存 -->
	<Card>
		<CardHeader>
			<CardTitle>语言设置</CardTitle>
			<CardDescription>选择应用程序的显示语言</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex flex-col space-y-2">
				<Label>当前语言</Label>
				<div class="flex gap-2">
					{#each Object.keys(langCode2Name) as langCode}
						<Button
							variant={$currentSettings.base.langCode === langCode ? 'default' : 'outline'}
							size="sm"
							onclick={() => handleLanguageChange(langCode as AppLanguageCode)}
						>
							{langCode2Name[langCode as AppLanguageCode]}
						</Button>
					{/each}
				</div>
			</div>
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
				<Slider
					type="single"
					bind:value={$currentSettings.base.zoom}
					min={0.5}
					max={2}
					step={0.1}
				/>
			</div>
		</CardContent>
	</Card>
</Tabs.Content>
