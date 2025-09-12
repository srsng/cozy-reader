<script lang="ts" module>
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { Switch } from '@cozy/ui/switch';
	import * as Card from '@cozy/ui/card';
	import LanguageDropDown from './language.svelte';
	import { m } from '$lib/paraglide/messages';
	import { Badge } from '@cozy/ui/badge';
	import { langCode2Name } from '$lib/settings/Base';
	import { ZoomForm } from '$lib/components/forms';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';
	import { Separator } from '@cozy/ui/separator';
	import { DEFAULT_OPACITY } from '$lib/settings/background';
	import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
</script>

<script lang="ts">
	const currentSettings = inject(USER_SETTINGS);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>
			{m['settings.languageSetting']()}
			<Badge>{langCode2Name[$currentSettings.base.langCode]}</Badge>
		</Card.Title>
		<Card.Description>选择应用程序的显示语言</Card.Description>
		<Card.Action>
			<LanguageDropDown variant="default" />
		</Card.Action>
	</Card.Header>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>界面设置</Card.Title>
		<Card.Description>控制应用程序界面的显示选项</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<Card.ContentItem label="UI透明度" description="调整整体界面透明度">
			<SliderWithControls
				bind:value={$currentSettings.base.uiOpacity}
				min={0.1}
				max={1}
				step={0.01}
				defaultValue={DEFAULT_OPACITY}
			>
				{#snippet valueLabel()}
					<span class="text-muted-foreground ml-4 w-12 pr-2 text-sm">
						{Math.round($currentSettings.base.uiOpacity * 100)}%
					</span>
				{/snippet}
			</SliderWithControls>
		</Card.ContentItem>
		<Card.ContentItem
			label="窗口背景层透明"
			description="窗口背景层是否透明，也会让标题栏等布局控件背景透明"
		>
			<Switch bind:checked={$currentSettings.base.bodyTransparent} />
		</Card.ContentItem>
		<Card.ContentItem
			label="标题栏等布局控件外框线"
			description="如果启用了窗口背景层透明，关闭该项可以提升沉浸感"
		>
			<Switch bind:checked={$currentSettings.base.layoutControlsOutline} />
		</Card.ContentItem>
		<Card.ContentItem label="缩放比例" description="应用程序的整体缩放比例">
			<ZoomForm label />
		</Card.ContentItem>
		<Card.ContentItem label="始终置顶" description="让窗口始终保持在最前面">
			<Switch
				checked={$currentSettings.base.alwaysOnTop}
				onCheckedChange={() => emitMainWindowEvent('toggle-always-on-top')}
			/>
		</Card.ContentItem>
		<Separator />
		<Card.ContentItem label="标题栏" description="显示应用程序标题栏">
			<Switch bind:checked={$currentSettings.layout.titlebar} />
		</Card.ContentItem>
		<Card.ContentItem label="页眉" description="显示页面顶部导航栏">
			<Switch bind:checked={$currentSettings.layout.header} />
		</Card.ContentItem>
		<Card.ContentItem label="页脚" description="显示页面底部信息栏">
			<Switch bind:checked={$currentSettings.layout.footer} />
		</Card.ContentItem>
	</Card.Content>
</Card.Root>
