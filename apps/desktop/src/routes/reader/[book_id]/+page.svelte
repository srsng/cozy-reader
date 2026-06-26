<script lang="ts">
    import { slide } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { uniqueId } from '$lib/reader/utils/misc';
    import { readerStore } from '$lib/reader/stores/readerStore';
    import Markdown from '$lib/components/reader/markdown/Markdown.svelte';
    import FoliateReader from '$lib/components/reader/foliate/FoliateReader.svelte';

    const { data } = $props();

    // 生成 bookKey
    const bookKey = `${data.book.id}-${uniqueId()}`;

    onMount(() => {
        // 将 bookKey 添加到 bookKeys 列表
        const currentBookKeys = readerStore.getBookKeys();
        if (!currentBookKeys.includes(bookKey)) {
            readerStore.setBookKeys([...currentBookKeys, bookKey]);
        }
    });
</script>

<div class="h-full overflow-hidden" transition:slide>
    {#if data.isText}
        <!-- 文本格式（txt/md/markdown/html）使用 Markdown 组件 -->
        <div class="mx-auto h-full max-w-3xl overflow-y-auto p-8">
            <Markdown filePath={data.filePath} content={data.content} />
        </div>
    {:else}
        <!-- epub/pdf/mobi等使用 FoliateReader -->
        <FoliateReader filePath={data.filePath} book={data.book} {bookKey} />
    {/if}
</div>
