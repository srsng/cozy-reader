<script lang="ts">
    import { Button } from '$ui/button';
    import * as Card from '$ui/card';
    import { goto } from '$app/navigation';
    import {
        goBack,
        canGoBack,
        getCurrentPath,
        getHistoryLength,
        getCurrentHistoryIndex,
        getPageHistory,
        clearHistory,
        goRoute
    } from '$lib/utils/route.svelte';
</script>

<div class="container mx-auto space-y-6 p-6">
    <Card.Root>
        <Card.Header>
            <Card.Title>路由导航演示</Card.Title>
            <Card.Description>演示 goBack 功能和其他路由工具函数</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="space-y-2">
                    <h3 class="font-semibold">当前状态</h3>
                    <p class="text-muted-foreground text-sm">当前路径: {getCurrentPath()}</p>
                    <p class="text-muted-foreground text-sm">历史记录长度: {getHistoryLength()}</p>
                    <p class="text-muted-foreground text-sm">
                        可以返回: {canGoBack() ? '是' : '否'}
                    </p>
                </div>

                <div class="space-y-2">
                    <h3 class="font-semibold">操作</h3>
                    <div class="flex flex-wrap gap-2">
                        {#if canGoBack()}
                            <Button variant="outline" onclick={() => goBack()} size="sm"
                                >返回上一页</Button
                            >
                        {/if}
                        <Button onclick={() => clearHistory()} variant="destructive" size="sm"
                            >清空历史</Button
                        >
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <h3 class="font-semibold">导航到其他页面</h3>
                <div class="flex flex-wrap gap-2">
                    <Button variant="outline" onclick={() => goto('/')} size="sm">首页</Button>
                    <Button variant="outline" onclick={() => goto('/settings/')} size="sm"
                        >设置</Button
                    >
                    <Button variant="outline" onclick={() => goto('/demo/paraglide')} size="sm">
                        国际化演示
                    </Button>
                    <Button
                        variant="outline"
                        onclick={() => goRoute('/demo/route-demo?normal=1')}
                        size="sm"
                    >
                        可返回页
                    </Button>
                    <Button
                        variant="outline"
                        onclick={() => goRoute('/demo/route-demo?skip=1', { skipOnBack: true })}
                        size="sm"
                    >
                        跳过页
                    </Button>
                </div>
            </div>

            <div class="space-y-2">
                <h3 class="font-semibold">历史记录</h3>
                <div class="bg-muted rounded-md p-3">
                    {#if getHistoryLength() > 0}
                        <div class="space-y-1">
                            {#each getPageHistory() as entry, index}
                                <div
                                    class="text-sm {index === getCurrentHistoryIndex()
                                        ? 'text-primary font-semibold'
                                        : 'text-muted-foreground'}"
                                >
                                    {index + 1}. {entry.url}
                                    {#if entry.skipOnBack}
                                        <span class="text-destructive ml-2">跳过</span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-muted-foreground text-sm">暂无历史记录</p>
                    {/if}
                </div>
            </div>
        </Card.Content>
    </Card.Root>
</div>
