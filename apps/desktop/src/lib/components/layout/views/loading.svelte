<script lang="ts">
    import InfoCard from '$lib/components/common/info-card.svelte';
    import { Loader } from 'lucide-svelte';

    interface Props {
        /** 标题 */
        title?: string;
        /** 主要信息内容 */
        message?: string | string[];
    }

    const { title = '加载中', message = '请稍后' }: Props = $props();
</script>

<InfoCard {title} {message}>
    {#snippet header()}
        <Loader class="h-12 w-12 animate-[spin_2s_linear_infinite]" />
    {/snippet}
</InfoCard>
