<!-- todo -->
<script lang="ts" module>
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		CardAction
	} from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Separator } from '$lib/components/ui/separator';
	import * as Alert from '$lib/components/ui/alert';
	import { ButtonType } from '$lib/settings/Layout';
	import type { ButtonConfig } from '$lib/settings/Layout';
	import { DefaultTitleBarConfig } from '$lib/settings/Layout';
	import {
		ButtonSelectorForm,
		ConfigPreviewForm,
		ActionButtonsForm
	} from '$lib/components/forms/bar';
	import { Info, Settings2 } from 'lucide-svelte';
	import { inject } from '$lib/utils/context';
	import { USER_SETTINGS, saveUserSettingsManually } from '$lib/stores/userSettings';
	import { onDestroy } from 'svelte';
</script>

<script lang="ts">
	// 注入用户设置store
	const userSettings = inject(USER_SETTINGS);

	let activeTab = $state('titlebar');

	function addButton(type: ButtonType, section: 'left' | 'center' | 'right') {
		const newButton: ButtonConfig = {
			name: `${type}-${Date.now()}`,
			type,
			enabled: true,
			order: $userSettings.layout.layoutConfigs.titlebar[section].length
		};

		$userSettings.layout.layoutConfigs.titlebar = {
			...$userSettings.layout.layoutConfigs.titlebar,
			[section]: [...$userSettings.layout.layoutConfigs.titlebar[section], newButton]
		};
	}

	function resetToDefault() {
		$userSettings.layout.layoutConfigs.titlebar = structuredClone(DefaultTitleBarConfig);
	}

	onDestroy(async () => {
		await saveUserSettingsManually(userSettings);
	});
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- 信息提示 -->
	<Alert.Root>
		<Info class="h-4 w-4" />
		<Alert.Title>栏配置说明</Alert.Title>
		<Alert.Description>
			使用拖拽、点击和删除操作来自定义您的工具栏布局。所有更改会自动保存。
		</Alert.Description>
	</Alert.Root>

	<!-- 页面头部 -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight">栏配置</h1>
		<p class="text-muted-foreground mt-2">直接在预览中拖拽、添加和删除按钮来配置工具栏</p>
	</div>

	<Separator />

	<!-- 主要内容 -->
	<Card>
		<CardHeader>
			<CardTitle>交互式配置</CardTitle>
			<CardDescription>直接在预览中操作按钮配置，支持拖拽、点击切换状态和删除</CardDescription>
			<CardAction>
				<ButtonSelectorForm
					onAddButton={addButton}
					onReset={resetToDefault}
					onSave={() => {}}
					section="left"
				/>
			</CardAction>
		</CardHeader>
		<Separator />
		<CardContent>
			<Tabs bind:value={activeTab}>
				<TabsList class="mb-6 grid w-full grid-cols-3">
					<TabsTrigger value="titlebar">标题栏</TabsTrigger>
					<TabsTrigger value="footbar">页脚栏</TabsTrigger>
					<TabsTrigger value="sidebar">侧边栏</TabsTrigger>
				</TabsList>

				<TabsContent value="titlebar">
					<div class="space-y-6">
						<!-- 交互式标题栏预览 -->
						<ConfigPreviewForm bind:config={$userSettings.layout.layoutConfigs.titlebar} />

						<!-- 操作说明 -->
						<ActionButtonsForm />
					</div>
				</TabsContent>

				<TabsContent value="footbar">
					<div class="text-muted-foreground py-16 text-center">
						<Settings2 class="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p class="text-lg font-medium">页脚栏配置即将推出</p>
						<p class="mt-2 text-sm">敬请期待更多自定义选项</p>
					</div>
				</TabsContent>

				<TabsContent value="sidebar">
					<div class="text-muted-foreground py-16 text-center">
						<Settings2 class="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p class="text-lg font-medium">侧边栏配置即将推出</p>
						<p class="mt-2 text-sm">敬请期待更多自定义选项</p>
					</div>
				</TabsContent>
			</Tabs>
		</CardContent>
	</Card>
</div>
