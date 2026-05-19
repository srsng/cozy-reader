<script lang="ts">
    import { Button } from '$ui/button';
    import { cn } from '$utils';

    let {
        Map2Str,
        selected,
        onclick,
        noWrapper = false,
        wrapperClassname = "flex gap-2"
    }: {
        Map2Str: Record<any, String>;
        selected: any;
        onclick: (ele: any) => void;
        noWrapper: boolean;
        wrapperClassname: string;
    } = $props();
</script>

{#snippet Buttons()}
    {#each Object.keys(Map2Str) as keyEle}
        <Button
            variant={selected === keyEle ? 'default' : 'outline'}
            size="sm"
            onclick={() => onclick(keyEle)}
        >
            {Map2Str[keyEle]}
        </Button>
    {/each}
{/snippet}

{#if noWrapper}
    <Buttons></Buttons>
{:else}
    <div class={cn(wrapperClassname)}>
        <Buttons></Buttons>
    </div>
{/if}
