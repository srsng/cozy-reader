<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
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
	<CardContent class="space-y-4">
		<!-- 颜色展示 -->
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<h4 class="text-sm font-medium">主要颜色</h4>
				<div class="flex gap-2">
					<div class="bg-primary h-8 w-8 rounded border"></div>
					<div class="bg-secondary h-8 w-8 rounded border"></div>
					<div class="bg-accent h-8 w-8 rounded border"></div>
				</div>
			</div>
			<div class="space-y-2">
				<h4 class="text-sm font-medium">背景颜色</h4>
				<div class="flex gap-2">
					<div class="bg-background h-8 w-8 rounded border"></div>
					<div class="bg-card h-8 w-8 rounded border"></div>
					<div class="bg-muted h-8 w-8 rounded border"></div>
				</div>
			</div>
		</div>

		<!-- 组件预览 -->
		<div class="space-y-3">
			<h4 class="text-sm font-medium">组件预览</h4>
			<div class="flex flex-wrap gap-2">
				<Button size="sm">主要按钮</Button>
				<Button size="sm" variant="secondary">次要按钮</Button>
				<Button size="sm" variant="outline">轮廓按钮</Button>
				<Badge>标签</Badge>
				<Badge variant="secondary">次要标签</Badge>
			</div>
		</div>

		<!-- 文本预览 -->
		<div class="space-y-2">
			<h4 class="text-sm font-medium">文本预览</h4>
			<div class="space-y-1 text-sm">
				<p class="text-foreground">主要文本颜色</p>
				<p class="text-muted-foreground">次要文本颜色</p>
				<p class="text-primary">主要颜色文本</p>
			</div>
		</div>
	</CardContent>
</Card>
