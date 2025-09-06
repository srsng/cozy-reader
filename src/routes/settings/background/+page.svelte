<script lang="ts" module>
	import type { PageData } from './$types';
	import { BgForms } from '$lib/components/forms';
	import * as Tabs from '$lib/components/ui/tabs';
	import { slide } from 'svelte/transition';
</script>

<script>
	const { data } = $props<{ data: PageData }>();
	const metaData = data.metaData;
</script>

<svelte:head>
	<title>{metaData.title}</title>
	<meta name="description" content={metaData.description} />
</svelte:head>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3" transition:slide>
	<!-- 图片列表 -->
	<div class="lg:col-span-1">
		<BgForms.BgImagesForm />
	</div>

	<!-- 配置面板 -->
	<div class="space-y-6 lg:col-span-2">
		<Tabs.Root value="global" class="w-full">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="global">全局设置</Tabs.Trigger>
				<Tabs.Trigger value="overlay">遮罩层</Tabs.Trigger>
				<Tabs.Trigger value="custom">图片独立配置</Tabs.Trigger>
			</Tabs.List>
			<!-- 全局设置标签页 -->
			<Tabs.Content value="global" class="space-y-2">
				<BgForms.BgGlobalForm />
			</Tabs.Content>

			<!-- 遮罩层标签页 -->
			<Tabs.Content value="overlay" class="space-y-2">
				<BgForms.BgOverlayForm />
			</Tabs.Content>

			<!-- 自定义配置标签页 -->
			<Tabs.Content value="custom" class="space-y-2">
				<BgForms.BgCustomForm />
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>

<style></style>
