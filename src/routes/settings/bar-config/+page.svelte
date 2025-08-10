<!-- todo -->
<script lang="ts" module>
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import type { BarConfig, ButtonConfig, ButtonType } from '$lib/settings/Layout';
	import { DefaultTitleBarConfig } from '$lib/settings/Layout';
	import { ConfigurableBar } from '$lib/components/layout/util-btn';
	import DraggableButtonList from '$lib/components/layout/util-btn/DraggableButtonList.svelte';
	import { Plus, Settings2, Trash2 } from 'lucide-svelte';
</script>

<script lang="ts">
	let { titleBarConfig = DefaultTitleBarConfig, previewConfig = DefaultTitleBarConfig } = $props<{
		titleBarConfig?: BarConfig;
		previewConfig?: BarConfig;
	}>();

	// 使用响应式变量
	let currentTitleBarConfig = $state(titleBarConfig);
	let currentPreviewConfig = $state(titleBarConfig);

	const buttonTypes: ButtonType[] = [
		'home',
		'settings',
		'refresh',
		'zoom',
		'app-icon',
		'app-title',
		'theme-toggle',
		'always-on-top',
		'drag',
		'minimize',
		'maximize',
		'close',
		'custom'
	];

	function addButton(type: ButtonType, section: 'left' | 'center' | 'right') {
		const newButton: ButtonConfig = {
			name: `${type}-${Date.now()}`,
			type,
			enabled: true,
			order: currentTitleBarConfig[section].length
		};

		currentTitleBarConfig = {
			...currentTitleBarConfig,
			[section]: [...currentTitleBarConfig[section], newButton]
		};

		currentPreviewConfig = { ...currentTitleBarConfig };
	}

	function removeButton(buttonId: string, section: 'left' | 'center' | 'right') {
		currentTitleBarConfig = {
			...currentTitleBarConfig,
			[section]: currentTitleBarConfig[section].filter((btn) => btn.id !== buttonId)
		};

		// 重新排序
		currentTitleBarConfig[section].forEach((btn, index) => {
			btn.order = index;
		});

		currentPreviewConfig = { ...currentTitleBarConfig };
	}

	function toggleButton(buttonId: string, section: 'left' | 'center' | 'right') {
		currentTitleBarConfig = {
			...currentTitleBarConfig,
			[section]: currentTitleBarConfig[section].map((btn) =>
				btn.id === buttonId ? { ...btn, enabled: !btn.enabled } : btn
			)
		};

		currentPreviewConfig = { ...currentTitleBarConfig };
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">栏配置</h1>
			<p class="text-muted-foreground">自定义标题栏、页脚栏和侧边栏的按钮布局</p>
		</div>
		<Button variant="outline" size="sm">
			<Settings2 class="mr-2 h-4 w-4" />
			重置为默认
		</Button>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- 配置面板 -->
		<div class="space-y-6">
			<Tabs value="titlebar" class="w-full">
				<TabsList class="grid w-full grid-cols-3">
					<TabsTrigger value="titlebar">标题栏</TabsTrigger>
					<TabsTrigger value="footbar">页脚栏</TabsTrigger>
					<TabsTrigger value="sidebar">侧边栏</TabsTrigger>
				</TabsList>

				<TabsContent value="titlebar" class="space-y-4">
					<!-- 左侧区域 -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								左侧区域
								<Button variant="outline" size="sm" onclick={() => addButton('home', 'left')}>
									<Plus class="mr-1 h-4 w-4" />
									添加按钮
								</Button>
							</CardTitle>
							<CardDescription>管理左侧区域的按钮</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								{#each currentTitleBarConfig.left as item (item.id)}
									<div class="bg-background flex items-center gap-2 rounded-lg border p-2">
										<Badge variant={item.enabled ? 'default' : 'secondary'}>
											{item.type}
										</Badge>
										<span class="text-muted-foreground text-sm">#{item.order}</span>
										<div class="ml-auto flex gap-1">
											<Button
												variant="outline"
												size="sm"
												onclick={() => toggleButton(item.id, 'left')}
											>
												{item.enabled ? '启用' : '禁用'}
											</Button>
											<Button
												variant="outline"
												size="sm"
												onclick={() => removeButton(item.id, 'left')}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>

					<!-- 中间区域 -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								中间区域
								<Button variant="outline" size="sm" onclick={() => addButton('app-icon', 'center')}>
									<Plus class="mr-1 h-4 w-4" />
									添加按钮
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								{#each currentTitleBarConfig.center as item (item.id)}
									<div class="bg-background flex items-center gap-2 rounded-lg border p-2">
										<Badge variant={item.enabled ? 'default' : 'secondary'}>
											{item.type}
										</Badge>
										<span class="text-muted-foreground text-sm">#{item.order}</span>
										<div class="ml-auto flex gap-1">
											<Button
												variant="outline"
												size="sm"
												onclick={() => toggleButton(item.id, 'center')}
											>
												{item.enabled ? '启用' : '禁用'}
											</Button>
											<Button
												variant="outline"
												size="sm"
												onclick={() => removeButton(item.id, 'center')}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>

					<!-- 右侧区域 -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								右侧区域
								<Button
									variant="outline"
									size="sm"
									onclick={() => addButton('theme-toggle', 'right')}
								>
									<Plus class="mr-1 h-4 w-4" />
									添加按钮
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								{#each currentTitleBarConfig.right as item (item.id)}
									<div class="bg-background flex items-center gap-2 rounded-lg border p-2">
										<Badge variant={item.enabled ? 'default' : 'secondary'}>
											{item.type}
										</Badge>
										<span class="text-muted-foreground text-sm">#{item.order}</span>
										<div class="ml-auto flex gap-1">
											<Button
												variant="outline"
												size="sm"
												onclick={() => toggleButton(item.id, 'right')}
											>
												{item.enabled ? '启用' : '禁用'}
											</Button>
											<Button
												variant="outline"
												size="sm"
												onclick={() => removeButton(item.id, 'right')}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="footbar" class="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>页脚栏配置</CardTitle>
							<CardDescription>页脚栏功能尚未实现</CardDescription>
						</CardHeader>
					</Card>
				</TabsContent>

				<TabsContent value="sidebar" class="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>侧边栏配置</CardTitle>
							<CardDescription>侧边栏功能尚未实现</CardDescription>
						</CardHeader>
					</Card>
				</TabsContent>
			</Tabs>
		</div>

		<!-- 预览面板 -->
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>实时预览</CardTitle>
					<CardDescription>查看配置后的效果</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="bg-background rounded-lg border">
						<ConfigurableBar
							appTitle="Cozy Reader"
							config={currentPreviewConfig}
							btnDsiabled
							className="flex w-full items-center justify-between p-2"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>可用按钮类型</CardTitle>
					<CardDescription>点击添加按钮到指定区域</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="flex flex-wrap gap-2">
						{#each buttonTypes as type}
							<Badge
								variant="outline"
								class="hover:bg-primary hover:text-primary-foreground cursor-pointer"
								onclick={() => addButton(type, 'left')}
							>
								{type}
							</Badge>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
