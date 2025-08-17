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
	import { ALL_BUTTON_TYPES, ButtonType } from '$lib/settings/Layout';
	import type { BarConfig, ButtonConfig } from '$lib/settings/Layout';
	import { DefaultTitleBarConfig } from '$lib/settings/Layout';
	import ConfigurableBar from '$lib/components/layout/ConfigurableBar.svelte';
	import DraggableButtonList from '$lib/components/layout/DraggableButtonList.svelte';
	import { Plus, Settings2, Trash2 } from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
</script>

<script lang="ts">
	let { titleBarConfig = DefaultTitleBarConfig, previewConfig = DefaultTitleBarConfig } = $props<{
		titleBarConfig?: BarConfig;
		previewConfig?: BarConfig;
	}>();

	// 使用响应式变量
	let currentTitleBarConfig = $state(titleBarConfig);
	let currentPreviewConfig = $state(titleBarConfig);

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
			[section]: currentTitleBarConfig[section].filter((btn: ButtonConfig) => btn.name !== buttonId)
		};

		// 重新排序
		currentTitleBarConfig[section].forEach((btn: ButtonConfig, index: number) => {
			btn.order = index;
		});

		currentPreviewConfig = { ...currentTitleBarConfig };
	}

	function toggleButton(buttonId: string, section: 'left' | 'center' | 'right') {
		currentTitleBarConfig = {
			...currentTitleBarConfig,
			[section]: currentTitleBarConfig[section].map((btn: ButtonConfig) =>
				btn.name === buttonId ? { ...btn, enabled: !btn.enabled } : btn
			)
		};

		currentPreviewConfig = { ...currentTitleBarConfig };
	}
</script>

<div class="container mx-auto space-y-6">
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

	<!-- todo 调整布局 未知原因导致主layout也出现了scroll-->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- 配置面板 -->
		<ScrollArea class="h-[70%] w-full rounded-md border">
			<div class="p-4">
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
										{#each currentTitleBarConfig.left as item (item.name)}
											<div class="bg-background flex items-center gap-2 rounded-lg border p-2">
												<Badge variant={item.enabled ? 'default' : 'secondary'}>
													{item.type}
												</Badge>
												<span class="text-muted-foreground text-sm">#{item.order}</span>
												<div class="ml-auto flex gap-1">
													<Button
														variant="outline"
														size="sm"
														onclick={() => toggleButton(item.name, 'left')}
													>
														{item.enabled ? '启用' : '禁用'}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onclick={() => removeButton(item.name, 'left')}
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
										<Button
											variant="outline"
											size="sm"
											onclick={() => addButton('app-icon', 'center')}
										>
											<Plus class="mr-1 h-4 w-4" />
											添加按钮
										</Button>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div class="space-y-2">
										{#each currentTitleBarConfig.center as item (item.name)}
											<div class="bg-background flex items-center gap-2 rounded-lg border p-2">
												<Badge variant={item.enabled ? 'default' : 'secondary'}>
													{item.type}
												</Badge>
												<span class="text-muted-foreground text-sm">#{item.order}</span>
												<div class="ml-auto flex gap-1">
													<Button
														variant="outline"
														size="sm"
														onclick={() => toggleButton(item.name, 'center')}
													>
														{item.enabled ? '启用' : '禁用'}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onclick={() => removeButton(item.name, 'center')}
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
										{#each currentTitleBarConfig.right as item (item.name)}
											<div class="bg-background flex items-center gap-2 rounded-lg border p-2">
												<Badge variant={item.enabled ? 'default' : 'secondary'}>
													{item.type}
												</Badge>
												<span class="text-muted-foreground text-sm">#{item.order}</span>
												<div class="ml-auto flex gap-1">
													<Button
														variant="outline"
														size="sm"
														onclick={() => toggleButton(item.name, 'right')}
													>
														{item.enabled ? '启用' : '禁用'}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onclick={() => removeButton(item.name, 'right')}
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
			</div>
		</ScrollArea>
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
						{#each ALL_BUTTON_TYPES as type}
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
