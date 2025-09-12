<script lang="ts">
	import InfoCard from '$lib/components/common/info-card.svelte';
	import { Info } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		/** 标题 */
		title: string;
		/** 主要信息内容 */
		message: string | string[];
		/** footer 可以放按钮等 */
		footer?: Snippet;
	}

	const { title, message, footer }: Props = $props();
</script>

<InfoCard {title} {message} {footer}>
	{#snippet header()}
		<Info class="h-12 w-12" />
	{/snippet}
</InfoCard>
