<script lang="ts">
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import {
		Card,
		CardContent,
		CardContentItem,
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
		<CardContentItem
			label="UI透明度"
			description="调整整体界面透明度: {Math.round($currentSettings.base.uiOpacity * 100)}%"
		>
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
					$currentSettings.base.uiOpacity = 0.96;
				}}
			>
				<RotateCcw />
			</Button>
		</CardContentItem>
		<CardContentItem label="缩放比例" description="调整应用程序的整体缩放比例">
			<ZoomForm label />
		</CardContentItem>
		<CardContentItem label="始终置顶" description="窗口始终保持在最前面">
			<Switch
				checked={$currentSettings.base.alwaysOnTop}
				onCheckedChange={() => emitMainWindowEvent('toggle-always-on-top')}
			/>
		</CardContentItem>
		<Separator />
		<CardContentItem label="标题栏" description="显示应用程序标题栏">
			<Switch bind:checked={$currentSettings.layout.titlebar} />
		</CardContentItem>
		<CardContentItem label="页眉" description="显示页面顶部导航栏">
			<Switch bind:checked={$currentSettings.layout.header} />
		</CardContentItem>
		<CardContentItem label="页脚" description="显示页面底部信息栏">
			<Switch bind:checked={$currentSettings.layout.footer} />
		</CardContentItem>
	</CardContent>
</Card>
