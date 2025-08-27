<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { BookOpen, Settings, Palette, FileText, Globe, Navigation } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
</script>

<div class="container mx-auto max-w-4xl px-4 py-8" in:slide>
	<!-- 主标题 -->
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold">Cozy Reader</h1>
		<p class="text-muted-foreground text-lg">一个舒适的 Markdown 阅读器，支持主题定制和背景配置</p>
	</div>

	<!-- 功能模块卡片 -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Markdown 阅读器 -->
		<Card.Root
			class="cursor-pointer transition-shadow hover:shadow-lg"
			onclick={() => goto('/md_reader')}
		>
			<Card.Header>
				<div class="flex items-center gap-3">
					<BookOpen class="text-primary h-6 w-6" />
					<Card.Title>Markdown 阅读器</Card.Title>
				</div>
				<Card.Description>支持 Markdown 文档阅读，提供舒适的阅读体验</Card.Description>
			</Card.Header>
		</Card.Root>

		<!-- 设置中心 -->
		<Card.Root
			class="cursor-pointer transition-shadow hover:shadow-lg"
			onclick={() => goto('/settings')}
		>
			<Card.Header>
				<div class="flex items-center gap-3">
					<Settings class="text-primary h-6 w-6" />
					<Card.Title>设置中心</Card.Title>
				</div>
				<Card.Description>基础设置、主题配置和阅读器个性化选项</Card.Description>
			</Card.Header>
		</Card.Root>

		<!-- 背景设置 -->
		<Card.Root
			class="cursor-pointer transition-shadow hover:shadow-lg"
			onclick={() => goto('/settings/background')}
		>
			<Card.Header>
				<div class="flex items-center gap-3">
					<Palette class="text-primary h-6 w-6" />
					<Card.Title>背景设置</Card.Title>
				</div>
				<Card.Description>管理背景图片、遮罩层和个性化背景配置</Card.Description>
			</Card.Header>
		</Card.Root>

		<!-- 演示中心 -->
		<!-- <Card.Root class="hover:shadow-lg transition-shadow cursor-pointer" onclick={() => goto('/demo')}>
			<Card.Header>
				<div class="flex items-center gap-3">
					<FileText class="h-6 w-6 text-primary" />
					<Card.Title>演示中心</Card.Title>
				</div>
				<Card.Description>
					功能演示和测试页面，包含国际化和路由导航示例
				</Card.Description>
			</Card.Header>
		</Card.Root> -->

		<!-- 国际化演示 -->
		<!-- <Card.Root class="hover:shadow-lg transition-shadow cursor-pointer" onclick={() => goto('/demo/paraglide')}>
			<Card.Header>
				<div class="flex items-center gap-3">
					<Globe class="h-6 w-6 text-primary" />
					<Card.Title>国际化演示</Card.Title>
				</div>
				<Card.Description>
					多语言支持演示，基于 Paraglide 国际化框架
				</Card.Description>
			</Card.Header>
		</Card.Root> -->

		<!-- 路由导航演示 -->
		<!-- <Card.Root class="hover:shadow-lg transition-shadow cursor-pointer" onclick={() => goto('/demo/route-demo')}>
			<Card.Header>
				<div class="flex items-center gap-3">
					<Navigation class="h-6 w-6 text-primary" />
					<Card.Title>路由导航演示</Card.Title>
				</div>
				<Card.Description>
					路由导航功能测试，包含返回功能和历史记录管理
				</Card.Description>
			</Card.Header>
		</Card.Root> -->
	</div>

	<!-- 项目特性 -->
	<!-- <Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>项目特性</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<h4 class="font-semibold">技术栈</h4>
					<ul class="text-sm text-muted-foreground space-y-1">
						<li>• SvelteKit 5 + TypeScript</li>
						<li>• Tauri 2.0 桌面应用框架</li>
						<li>• TailwindCSS 样式框架</li>
						<li>• Paraglide 国际化支持</li>
					</ul>
				</div>
				<div class="space-y-2">
					<h4 class="font-semibold">核心功能</h4>
					<ul class="text-sm text-muted-foreground space-y-1">
						<li>• Markdown 文档阅读</li>
						<li>• 主题系统与背景定制</li>
						<li>• 响应式设计</li>
						<li>• 多语言界面支持</li>
					</ul>
				</div>
			</div>
		</Card.Content>
	</Card.Root> -->

	<!-- 快速开始 -->
	<div class="text-center">
		<h3 class="mb-4 text-xl font-semibold">快速开始</h3>
		<div class="flex flex-wrap justify-center gap-3">
			<Button onclick={() => goto('/md_reader')} class="gap-2">
				<BookOpen class="h-4 w-4" />
				开始阅读
			</Button>
			<Button variant="outline" onclick={() => goto('/settings')} class="gap-2">
				<Settings class="h-4 w-4" />
				个性化设置
			</Button>
			<Button variant="outline" onclick={() => goto('/settings/background')} class="gap-2">
				<Palette class="h-4 w-4" />
				背景配置
			</Button>
		</div>
	</div>
</div>
