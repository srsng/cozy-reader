<script lang="ts" module>
    import Self from './MarkdownContent.svelte';
    import type { MarkdownToken } from './math';
    import type { Component } from 'svelte';

    import { renderers } from '$lib/components/typography';
    import type { MarkdownTableCell } from '$lib/components/typography/table.svelte';

    type Props = ({ type: 'init'; tokens: MarkdownToken[] } | MarkdownToken) & {
        mdSrcPath: string;
    };
    
    type MarkdownRenderer = Component<Record<string, unknown>>;
</script>

<script lang="ts">
    const { type, mdSrcPath, ...rest }: Props = $props();
</script>

{#if type === 'init' && 'tokens' in rest && rest.tokens}
    {#each rest.tokens as token}
        <Self {...token} {mdSrcPath} />
    {/each}
{:else if renderers[type as keyof typeof renderers]}
    {@const CurrentComponent = renderers[type as keyof typeof renderers] as MarkdownRenderer}
    {#if type === 'table'}
        <CurrentComponent {...rest} {mdSrcPath}>
            {#snippet cell(tableCell: MarkdownTableCell)}
                <Self type="init" tokens={tableCell.tokens as MarkdownToken[]} {mdSrcPath} />
            {/snippet}
        </CurrentComponent>
    {:else if type === 'list'}
        {@const listItems = (rest as Extract<Props, { type: 'list' }>).items}
        <CurrentComponent {...rest} {mdSrcPath}>
            {#each listItems as item}
                {@const ChildComponent = renderers[item.type] as unknown as MarkdownRenderer}
                <ChildComponent {...item}>
                    <Self type="init" tokens={item.tokens} {mdSrcPath} />
                </ChildComponent>
            {/each}
        </CurrentComponent>
    {:else}
        <CurrentComponent {...rest} {mdSrcPath}>
            {#if 'tokens' in rest && rest.tokens}
                <Self type="init" tokens={rest.tokens} {mdSrcPath} />
            {:else if 'raw' in rest}
                {rest.raw}
            {/if}
        </CurrentComponent>
    {/if}
{/if}
