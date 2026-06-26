<script lang="ts" module>
    import type { Snippet } from 'svelte';
    import * as Table from '$ui/table';

    export interface MarkdownTableCell {
        text: string;
        tokens: unknown[];
        header: boolean;
        align: 'center' | 'left' | 'right' | null;
    }

    interface Props {
        header: MarkdownTableCell[];
        rows: MarkdownTableCell[][];
        cell: Snippet<[MarkdownTableCell]>;
    }

    function alignClass(align: MarkdownTableCell['align']): string {
        if (align === 'center') return 'text-center';
        if (align === 'right') return 'text-right';
        return 'text-left';
    }
</script>

<script lang="ts">
    const { header = [], rows = [], cell }: Props = $props();
</script>

<Table.Root class="my-4">
    <Table.Header>
        <Table.Row>
            {#each header as headerCell}
                <Table.Head class={alignClass(headerCell.align)}>
                    {@render cell(headerCell)}
                </Table.Head>
            {/each}
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each rows as row}
            <Table.Row>
                {#each row as bodyCell}
                    <Table.Cell class={alignClass(bodyCell.align)}>
                        {@render cell(bodyCell)}
                    </Table.Cell>
                {/each}
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>
