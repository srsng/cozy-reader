<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import {
		goBgSettings,
		goReaderBatchAddPaths,
		goReaderHome,
		goReadFsBook,
		goSettings
	} from '$lib/utils/route.svelte';
	import { BookOpen, Settings, Palette, FileText, Navigation } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';
	import type { LayoutData } from './$types';

	const { data }: { data: LayoutData } = $props();
	const metaData = data.metaData;

	let paths = [
		`E:\\my_computer\\Documents\\电子书\\机器学习实践：测试驱动的开发方法_9787115396181.epub`,
		'E:/my_computer/Documents/工作汇总/学业情况/作业要求/2.2-大二下/英语课/英语活动读稿.md',
		'/pages/about'
	];
</script>

<div class="container mx-auto max-w-4xl px-4 py-8" in:slide>
	<!-- 主标题 -->
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold">{metaData.title}</h1>
		<p class="text-muted-foreground text-lg">{metaData.description}</p>
	</div>

	<!-- 功能模块卡片 -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Markdown 阅读器 -->
		<Card.Root class="cursor-pointer transition-shadow hover:shadow-lg" onclick={goReaderHome}>
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
			onclick={() => goBgSettings()}
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
		<Card.Root
			class="cursor-pointer transition-shadow hover:shadow-lg"
			onclick={() => goto('/demo')}
		>
			<Card.Header>
				<div class="flex items-center gap-3">
					<FileText class="text-primary h-6 w-6" />
					<Card.Title>演示中心</Card.Title>
				</div>
				<Card.Description>功能演示和测试页面，包含国际化和路由导航示例</Card.Description>
			</Card.Header>
		</Card.Root>

		<!-- 路由导航演示 -->
		<Card.Root
			class="cursor-pointer transition-shadow hover:shadow-lg"
			onclick={() => goto('/demo/route-demo')}
		>
			<Card.Header>
				<div class="flex items-center gap-3">
					<Navigation class="text-primary h-6 w-6" />
					<Card.Title>路由导航演示</Card.Title>
				</div>
				<Card.Description>路由导航功能测试，包含返回功能和历史记录管理</Card.Description>
			</Card.Header>
		</Card.Root>
	</div>

	<!-- 快速开始 -->
	<div class="text-center">
		<h3 class="mb-4 text-xl font-semibold">快速开始</h3>
		<div class="flex flex-wrap justify-center gap-3">
			<Button onclick={goReaderHome} class="gap-2">
				<BookOpen class="h-4 w-4" />
				开始阅读
			</Button>
			<Button variant="outline" onclick={() => goSettings('theme')} class="gap-2">
				<Settings class="h-4 w-4" />
				个性化设置
			</Button>
			<Button variant="outline" onclick={() => goBgSettings('golbal')} class="gap-2">
				<Palette class="h-4 w-4" />
				背景配置
			</Button>
			<Button
				variant="outline"
				onclick={() => {
					goReaderBatchAddPaths(paths);
				}}
				class="gap-2"
			>
				<Palette class="h-4 w-4" />
				Test
			</Button>
			<Button variant="outline" onclick={() => goReadFsBook(`E:\\`)} class="gap-2">
				<Palette class="h-4 w-4" />
				Test err
			</Button>
			<Button onclick={() => toast('Hello world')}>Show toast</Button>
		</div>
	</div>
</div>
