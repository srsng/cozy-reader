<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cozy/ui/card';
	import { Badge } from '@cozy/ui/badge';
	import { Separator } from '@cozy/ui/separator';
	import { Settings2, GripVertical, X, Plus } from 'lucide-svelte';
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-base">
			<Settings2 class="h-4 w-4" />
			操作说明
		</CardTitle>
		<CardDescription>了解如何使用交互式配置功能</CardDescription>
	</CardHeader>
	<Separator />
	<CardContent>
		<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
			<div class="flex items-center gap-3">
				<Badge variant="outline" class="flex h-8 w-8 items-center justify-center p-0">
					<GripVertical class="h-4 w-4" />
				</Badge>
				<span class="text-foreground">拖拽按钮可在不同区域间移动</span>
			</div>
			<div class="flex items-center gap-3">
				<Badge variant="default" class="flex h-8 w-8 items-center justify-center p-0 text-lg"
					>•</Badge
				>
				<span class="text-foreground">点击按钮可切换启用/禁用状态</span>
			</div>
			<div class="flex items-center gap-3">
				<Badge variant="destructive" class="flex h-8 w-8 items-center justify-center p-0">
					<X class="h-4 w-4" />
				</Badge>
				<span class="text-foreground">悬停按钮显示删除按钮</span>
			</div>
			<div class="flex items-center gap-3">
				<Badge variant="outline" class="flex h-8 w-8 items-center justify-center p-0">
					<Plus class="h-4 w-4" />
				</Badge>
				<span class="text-foreground">使用右上角的按钮选择器添加新按钮</span>
			</div>
		</div>
	</CardContent>
</Card>
