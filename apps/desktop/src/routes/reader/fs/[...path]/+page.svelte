<script>
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    import { goReaderHome } from '$lib/utils/route.svelte.js';

    const { data } = $props();

    // 这个页面主要用于处理路径参数并重定向
    // 正常情况下用户不会看到这个页面，因为会立即重定向
    onMount(() => {
        if (data.error) {
            // 显示错误toast
            const errorMessage = data.error.message;
            // const filePath = data.error.filePath;

            switch (data.error.type) {
                case 'unsupported_file':
                    toast.warning('文件类型不支持', {
                        description: errorMessage,
                        duration: 5000
                    });
                    break;
                case 'create_failed':
                    toast.error('创建书籍失败', {
                        description: errorMessage,
                        duration: 5000
                    });
                    break;
                default:
                    toast.error('处理文件时出错', {
                        description: errorMessage,
                        duration: 5000
                    });
            }

            // 延迟跳转回书架
            setTimeout(() => {
                goReaderHome();
            }, 3000);
        } else {
            // 如果页面加载但没有重定向，可能是出现了错误
            console.log('路径处理页面已加载，路径:', page.params.path);
        }
    });
</script>

<svelte:head>
    <title>处理文件路径 - Cozy Reader</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center p-8">
    <div class="max-w-md space-y-6 text-center">
        <div
            class="border-muted border-t-primary mx-auto h-10 w-10 animate-spin rounded-full border-4"
        ></div>
        <div class="space-y-2">
            <h2 class="text-foreground text-2xl font-bold">正在处理文件路径...</h2>
            <p class="text-muted-foreground">正在检查文件并添加到书架中，请稍候。</p>
        </div>

        {#if page.params.path}
            <div class="border-l-primary bg-muted rounded-lg border-l-4 p-4 text-left">
                <div class="break-all">
                    <strong class="text-foreground">文件路径:</strong>
                    <span class="text-muted-foreground ml-2">
                        {Array.isArray(page.params.path)
                            ? page.params.path.join('/')
                            : page.params.path}
                    </span>
                </div>
            </div>
        {/if}
    </div>
</div>
