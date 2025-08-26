<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Settings2, GripVertical, X, Plus } from 'lucide-svelte';
</script>

<Card>
	<CardHeader>
		<CardTitle class="text-base flex items-center gap-2">
			<Settings2 class="w-4 h-4" />
			操作说明
		</CardTitle>
		<CardDescription>了解如何使用交互式配置功能</CardDescription>
	</CardHeader>
	<Separator />
	<CardContent>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
			<div class="flex items-center gap-3">
				<Badge variant="outline" class="w-8 h-8 p-0 flex items-center justify-center">
					<GripVertical class="w-4 h-4" />
				</Badge>
				<span class="text-foreground">拖拽按钮可在不同区域间移动</span>
			</div>
			<div class="flex items-center gap-3">
				<Badge variant="default" class="w-8 h-8 p-0 flex items-center justify-center text-lg">•</Badge>
				<span class="text-foreground">点击按钮可切换启用/禁用状态</span>
			</div>
			<div class="flex items-center gap-3">
				<Badge variant="destructive" class="w-8 h-8 p-0 flex items-center justify-center">
					<X class="w-4 h-4" />
				</Badge>
				<span class="text-foreground">悬停按钮显示删除按钮</span>
			</div>
			<div class="flex items-center gap-3">
				<Badge variant="outline" class="w-8 h-8 p-0 flex items-center justify-center">
					<Plus class="w-4 h-4" />
				</Badge>
				<span class="text-foreground">使用右上角的按钮选择器添加新按钮</span>
			</div>
		</div>
	</CardContent>
</Card>