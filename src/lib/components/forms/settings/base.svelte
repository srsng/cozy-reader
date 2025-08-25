<script lang="ts">
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		CardAction
	} from '$lib/components/ui/card';
	import LanguageDropDown from './language.svelte';
	import { m } from '$lib/paraglide/messages';
	import { Badge } from '$lib/components/ui/badge';
	import { langCode2Name } from '$lib/settings/Base';
	import { ZoomForm } from '$lib/components/forms';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { Button } from '$lib/components/ui/button';
	import { RotateCcw } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';

	const currentSettings = inject(USER_SETTINGS);
</script>

<Card>
	<CardHeader>
		<CardTitle>
			{m['settings.languageSetting']()}
			<Badge>{langCode2Name[$currentSettings.base.langCode]}</Badge>
		</CardTitle>
		<CardDescription>选择应用程序的显示语言</CardDescription>
		<CardAction>
			<LanguageDropDown variant="default" />
		</CardAction>
	</CardHeader>
</Card>

<Card>
	<CardHeader>
		<CardTitle>界面设置</CardTitle>
		<CardDescription>控制应用程序界面的显示选项</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<!-- UI透明度 -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>UI透明度</Label>
					<p class="text-muted-foreground text-sm">调整整体界面透明度: 0~100%</p>
				</div>
			</div>
			<div class="flex items-center gap-4">
				<Slider
					type="single"
					class="flex-1"
					bind:value={$currentSettings.base.uiOpacity}
					min={0.1}
					max={1}
					step={0.01}
				/>
				<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
					{Math.round($currentSettings.base.uiOpacity * 100)}%
				</span>
				<Button
					variant="outline"
					size="icon"
					onclick={() => {
						$currentSettings.base.uiOpacity = 1;
					}}
				>
					<RotateCcw />
				</Button>
			</div>
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>缩放比例</Label>
					<p class="text-muted-foreground text-sm">调整应用程序的整体缩放比例</p>
				</div>
				<ZoomForm label />
			</div>
		</div>
		<Separator />
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>标题栏</Label>
				<p class="text-muted-foreground text-sm">显示应用程序标题栏</p>
			</div>
			<Switch bind:checked={$currentSettings.layout.titlebar} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>页眉</Label>
				<p class="text-muted-foreground text-sm">显示页面顶部导航栏</p>
			</div>
			<Switch bind:checked={$currentSettings.layout.header} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>页脚</Label>
				<p class="text-muted-foreground text-sm">显示页面底部信息栏</p>
			</div>
			<Switch bind:checked={$currentSettings.layout.footer} />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label>始终置顶</Label>
				<p class="text-muted-foreground text-sm">窗口始终保持在最前面</p>
			</div>
			<Switch
				checked={$currentSettings.base.alwaysOnTop}
				onCheckedChange={() => emitMainWindowEvent('toggle-always-on-top')}
			/>
		</div>
	</CardContent>
</Card>
