<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AppThemeType2Str, type AppThemeType } from '$lib/settings/Theme';

	let { themeType = 'standard' as AppThemeType } = $props();
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			主题展示
			<Badge variant="outline">{AppThemeType2Str[themeType]}</Badge>
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-6">
		<!-- 模拟应用界面场景 -->
		<div class="space-y-4">
			<h4 class="text-foreground text-sm font-medium">应用界面预览</h4>

			<!-- 模拟导航栏 -->
			<div class="bg-card border-border rounded-lg border p-4">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div
							class="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm font-medium"
						>
							Cozy Reader
						</div>
						<nav class="flex gap-4">
							<button class="text-foreground hover:text-primary text-sm">首页</button>
							<button class="text-muted-foreground hover:text-foreground text-sm">设置</button>
							<button class="text-muted-foreground hover:text-foreground text-sm">关于</button>
						</nav>
					</div>
					<div class="flex items-center gap-2">
						<Button size="sm" variant="outline">登录</Button>
						<Button size="sm">注册</Button>
					</div>
				</div>
			</div>

			<!-- 模拟图表展示 -->
			<div class="space-y-6">
				<!-- 阅读统计条形图 -->
				<Card class="p-4">
					<h5 class="text-card-foreground mb-4 text-lg font-semibold">本周阅读统计</h5>
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<span class="text-muted-foreground w-12 text-sm">周一</span>
							<div class="bg-muted h-4 flex-1 rounded-full">
								<div class="bg-chart-1 h-full w-3/4 rounded-full"></div>
							</div>
							<span class="text-foreground text-sm">3.2h</span>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-muted-foreground w-12 text-sm">周二</span>
							<div class="bg-muted h-4 flex-1 rounded-full">
								<div class="bg-chart-2 h-full w-1/2 rounded-full"></div>
							</div>
							<span class="text-foreground text-sm">2.1h</span>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-muted-foreground w-12 text-sm">周三</span>
							<div class="bg-muted h-4 flex-1 rounded-full">
								<div class="bg-chart-3 h-full w-5/6 rounded-full"></div>
							</div>
							<span class="text-foreground text-sm">3.8h</span>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-muted-foreground w-12 text-sm">周四</span>
							<div class="bg-muted h-4 flex-1 rounded-full">
								<div class="bg-chart-4 h-full w-2/3 rounded-full"></div>
							</div>
							<span class="text-foreground text-sm">2.7h</span>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-muted-foreground w-12 text-sm">周五</span>
							<div class="bg-muted h-4 flex-1 rounded-full">
								<div class="bg-chart-5 h-full w-4/5 rounded-full"></div>
							</div>
							<span class="text-foreground text-sm">3.5h</span>
						</div>
					</div>
				</Card>

				<!-- 书籍类型分布饼图 -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card class="p-4">
						<h5 class="text-card-foreground mb-4 text-lg font-semibold">书籍类型分布</h5>
						<div class="flex items-center justify-center">
							<!-- 简化的饼图表示 -->
							<div class="relative h-32 w-32">
								<div class="bg-chart-1 absolute inset-0 rounded-full" style="clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)"></div>
								<div class="bg-chart-2 absolute inset-0 rounded-full" style="clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 75% 100%)"></div>
								<div class="bg-chart-3 absolute inset-0 rounded-full" style="clip-path: polygon(50% 50%, 75% 100%, 25% 100%, 0% 75%)"></div>
								<div class="bg-chart-4 absolute inset-0 rounded-full" style="clip-path: polygon(50% 50%, 0% 75%, 0% 25%, 25% 0%)"></div>
								<div class="bg-chart-5 absolute inset-0 rounded-full" style="clip-path: polygon(50% 50%, 25% 0%, 50% 0%)"></div>
							</div>
						</div>
						<div class="mt-4 space-y-2">
							<div class="flex items-center gap-2">
								<div class="bg-chart-1 h-3 w-3 rounded-full"></div>
								<span class="text-foreground text-sm">技术类 (35%)</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="bg-chart-2 h-3 w-3 rounded-full"></div>
								<span class="text-foreground text-sm">文学类 (25%)</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="bg-chart-3 h-3 w-3 rounded-full"></div>
								<span class="text-foreground text-sm">历史类 (20%)</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="bg-chart-4 h-3 w-3 rounded-full"></div>
								<span class="text-foreground text-sm">科学类 (12%)</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="bg-chart-5 h-3 w-3 rounded-full"></div>
								<span class="text-foreground text-sm">其他类 (8%)</span>
							</div>
						</div>
					</Card>

					<!-- 月度阅读趋势 -->
					<Card class="p-4">
						<h5 class="text-card-foreground mb-4 text-lg font-semibold">月度阅读趋势</h5>
						<div class="flex h-32 items-end justify-between gap-2">
							<div class="flex flex-col items-center gap-1">
								<div class="bg-chart-1 w-6 rounded-t" style="height: 60%"></div>
								<span class="text-muted-foreground text-xs">1月</span>
							</div>
							<div class="flex flex-col items-center gap-1">
								<div class="bg-chart-2 w-6 rounded-t" style="height: 80%"></div>
								<span class="text-muted-foreground text-xs">2月</span>
							</div>
							<div class="flex flex-col items-center gap-1">
								<div class="bg-chart-3 w-6 rounded-t" style="height: 45%"></div>
								<span class="text-muted-foreground text-xs">3月</span>
							</div>
							<div class="flex flex-col items-center gap-1">
								<div class="bg-chart-4 w-6 rounded-t" style="height: 90%"></div>
								<span class="text-muted-foreground text-xs">4月</span>
							</div>
							<div class="flex flex-col items-center gap-1">
								<div class="bg-chart-5 w-6 rounded-t" style="height: 70%"></div>
								<span class="text-muted-foreground text-xs">5月</span>
							</div>
						</div>
					</Card>
				</div>
			</div>

			<!-- 模拟聊天界面 -->
			<Card class="p-4">
				<div class="space-y-3">
					<h5 class="text-card-foreground text-sm font-medium">阅读讨论</h5>
					<div class="space-y-3">
						<!-- 用户消息 -->
						<div class="flex justify-end">
							<div class="bg-primary text-primary-foreground max-w-xs rounded-lg px-3 py-2">
								<p class="text-sm">这本书的第三章写得真不错！</p>
								<p class="mt-1 text-xs opacity-75">刚刚</p>
							</div>
						</div>
						<!-- 其他用户消息 -->
						<div class="flex justify-start">
							<div class="bg-muted text-muted-foreground max-w-xs rounded-lg px-3 py-2">
								<p class="text-foreground text-sm">是的，作者的写作风格很独特</p>
								<p class="mt-1 text-xs">2分钟前</p>
							</div>
						</div>
						<!-- 系统消息 -->
						<div class="flex justify-center">
							<div class="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs">
								小明加入了讨论
							</div>
						</div>
					</div>
					<div class="mt-3 flex gap-2">
						<Input placeholder="输入消息..." class="flex-1" />
						<Button size="sm">发送</Button>
					</div>
				</div>
			</Card>

			<!-- 模拟侧边栏 -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
				<div class="lg:col-span-1">
					<Card class="bg-sidebar border-sidebar-border">
						<CardHeader class="pb-3">
							<CardTitle class="text-sidebar-foreground text-sm">导航菜单</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground rounded-md px-3 py-2 text-sm"
							>
								📚 我的书架
							</div>
							<div
								class="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer rounded-md px-3 py-2 text-sm"
							>
								⭐ 收藏夹
							</div>
							<div
								class="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer rounded-md px-3 py-2 text-sm"
							>
								📊 统计
							</div>
							<div
								class="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer rounded-md px-3 py-2 text-sm"
							>
								⚙️ 设置
							</div>
						</CardContent>
					</Card>
				</div>
				<div class="lg:col-span-3">
					<Card class="p-4">
						<div class="space-y-4">
							<h5 class="text-card-foreground text-lg font-semibold">最近阅读</h5>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div class="bg-accent text-accent-foreground rounded-lg p-3">
									<h6 class="font-medium">《代码整洁之道》</h6>
									<p class="mt-1 text-sm opacity-75">进度: 65%</p>
								</div>
								<div class="bg-muted text-foreground rounded-lg p-3">
									<h6 class="font-medium">《设计模式》</h6>
									<p class="text-muted-foreground mt-1 text-sm">进度: 32%</p>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>

			<!-- 模拟表单和状态 -->
			<Card class="p-4">
				<div class="space-y-4">
					<h5 class="text-card-foreground text-lg font-semibold">用户设置</h5>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-3">
							<div>
								<label for="username" class="text-foreground text-sm font-medium">用户名</label>
								<Input id="username" value="张三" class="mt-1" />
							</div>
							<div>
								<label for="email" class="text-foreground text-sm font-medium">邮箱</label>
								<Input id="email" value="zhangsan@example.com" class="mt-1" />
							</div>
						</div>
						<div class="space-y-3">
							<div class="bg-muted flex items-center justify-between rounded-lg p-3">
								<span class="text-foreground text-sm">深色模式</span>
								<div class="bg-primary relative h-6 w-10 rounded-full">
									<div
										class="bg-primary-foreground absolute right-1 top-1 h-4 w-4 rounded-full"
									></div>
								</div>
							</div>
							<div class="flex gap-2">
								<Button variant="outline" class="flex-1">取消</Button>
								<Button class="flex-1">保存</Button>
							</div>
							<div class="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
								<p class="text-destructive text-sm">⚠️ 请检查邮箱格式</p>
							</div>
						</div>
					</div>
				</div>
			</Card>

			<!-- 颜色变量说明 -->
			<div class="space-y-3">
				<h4 class="text-foreground text-sm font-medium">主题变量说明</h4>
				<div class="grid grid-cols-1 gap-3 text-xs md:grid-cols-2 lg:grid-cols-3">
					<div class="bg-muted rounded-lg p-3">
						<h6 class="text-foreground mb-2 font-medium">基础颜色</h6>
						<ul class="text-muted-foreground space-y-1">
							<li>• background: 页面背景</li>
							<li>• foreground: 主要文本</li>
							<li>• card: 卡片背景</li>
							<li>• muted: 次要背景</li>
						</ul>
					</div>
					<div class="bg-muted rounded-lg p-3">
						<h6 class="text-foreground mb-2 font-medium">交互颜色</h6>
						<ul class="text-muted-foreground space-y-1">
							<li>• primary: 主要按钮</li>
							<li>• secondary: 次要按钮</li>
							<li>• accent: 强调元素</li>
							<li>• destructive: 危险操作</li>
						</ul>
					</div>
					<div class="bg-muted rounded-lg p-3">
						<h6 class="text-foreground mb-2 font-medium">特殊用途</h6>
						<ul class="text-muted-foreground space-y-1">
							<li>• border: 边框线条</li>
							<li>• input: 输入框背景</li>
							<li>• ring: 焦点环</li>
							<li>• chart-*: 图表配色</li>
						</ul>
					</div>
				</div>
			</div>
		</div></CardContent
	>
</Card>
