<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { goBack, canGoBack, getCurrentPath, getHistoryLength } from '$lib/utils/route.svelte';
</script>

<Card.Root class="w-85% max-w-sm">
	<Card.Header>
		<Card.Title><h1>Welcome to SvelteKit</h1></Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
		<Card.Action>
			<Button>toast</Button>
		</Card.Action>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			<p class="text-muted-foreground text-sm">当前路径: {getCurrentPath()}</p>
			<p class="text-muted-foreground text-sm">历史记录长度: {getHistoryLength()}</p>
			<p class="text-muted-foreground text-sm">可以返回: {canGoBack() ? '是' : '否'}</p>
		</div>

		<div class="flex gap-2">
			<Button variant="outline" onclick={() => goto('/settings/bar-config')}>前往设置</Button>
			{#if canGoBack()}
				<Button variant="outline" onclick={goBack}>返回上一页</Button>
			{/if}
		</div>
	</Card.Content>
	<!-- <Card.Footer class="flex-col gap-2">
		<Button type="submit" class="w-full">Login</Button>
		<Button variant="outline" class="w-full">Login with Google</Button>
	</Card.Footer> -->
</Card.Root>

<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p><a href="/demo/paraglide">国际化演示</a></p>
<p><a href="/demo/route-demo">🚀 路由导航演示 (测试 goBack 功能)</a></p>
