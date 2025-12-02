<script lang="ts">
    import InfoCard from '$lib/components/common/info-card.svelte';
    import { Button } from '$ui/button';
    import { goReaderHome } from '$lib/utils/route.svelte.js';
    import { Info, Check, X, Frown, Loader } from 'lucide-svelte';
    // import { BookService, type Book, type DatabaseResult } from '$lib/database';
    // import type { Component } from 'svelte';

    import { page } from '$app/state';
    import { BookService } from '@cozy-reader/database';
    import { View } from '$lib/components/layout/views';

    // todo: 解决ts报错paths不存在的问题
    // @ts-ignore
    const paths: string[] = page.state.paths || [];

    const addResults = Promise.all(paths.map((path) => BookService.addBookByFsPath(path)));

    // function getMsgs(results: DatabaseResult<Book>[]) {
    // 	if (results.length === 0) return '没有有效书籍';

    // 	return results
    // 		.map((res, index) => {
    // 			if (res.success) {
    // 				return `${index + 1}. 添加成功：${res.data!.title}`;
    // 			} else {
    // 				return `${index + 1}. 添加失败：${res.error}`;
    // 			}
    // 		})
    // 		.join('\n\n');
    // }

    // const statusIcon: Component = $derived.by(() => {
    // 	if (results.length === 0) return Info;
    // 	if (results.every((res) => res.success)) return Check;
    // 	if (results.some((res) => res.success)) return Frown;
    // 	return X;
    // }) as unknown as Component;
</script>

{#await addResults}
    <View.Loading title="添加中" message="请稍后" />
{:then results}
    <!-- {@const msgs = getMsgs(results)} -->
    {#if results.length === 0}
        <View.Info
            title="无效"
            message={'没有给出有效书籍\n\n你是不小心来到这的吗？来了也没有奖励哦'}
        >
            {#snippet footer()}
                <Button variant="secondary" onclick={goReaderHome}>返回书库</Button>
            {/snippet}
        </View.Info>
    {:else}
        <InfoCard title="添加结果">
            {#snippet header()}
                <!-- <statusIcon></statusIcon> -->
                <Info class="h-12 w-12" />
            {/snippet}

            {#snippet body()}
                <ul class="space-y-3">
                    {#each results as res}
                        <li class="flex items-start gap-3 text-left">
                            {#if res.success}
                                <Check class="text-secondary mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span class="text-sm leading-relaxed">{res.data!.title}</span>
                            {:else}
                                <X class="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span class="text-sm leading-relaxed">{res.error}</span>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {/snippet}

            {#snippet footer()}
                <Button variant="secondary" onclick={goReaderHome}>返回书库</Button>
            {/snippet}
        </InfoCard>
    {/if}
{:catch error}
    <View.Error
        title="添加失败"
        message={error.message}
        footerBtnText="返回书库"
        footerBtnOnclick={goReaderHome}
    />
{/await}
