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
		CardTitle
	} from '$lib/components/ui/card';
	import LanguageDropDown from './language.svelte';
	import { m } from '$lib/paraglide/messages';
	import { Badge } from '$lib/components/ui/badge';
	import { langCode2Name } from '$lib/settings/Base';
	import { ZoomForm } from '$lib/components/forms';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';

	const currentSettings = inject(USER_SETTINGS);
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

<Card>
	<CardHeader>
		<CardTitle>
			{m['settings.languageSetting']()}
			<Badge>{langCode2Name[$currentSettings.base.langCode]}</Badge>
		</CardTitle>
		<CardDescription>选择应用程序的显示语言</CardDescription>
	</CardHeader>
	<CardContent>
		<LanguageDropDown />
	</CardContent>
</Card>

<Card>
	<CardHeader>
		<CardTitle>缩放设置</CardTitle>
		<CardDescription>调整应用程序的整体缩放比例</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<ZoomForm />
	</CardContent>
</Card>
