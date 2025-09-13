<script lang="ts">
	import InfoCard from '$lib/components/common/info-card.svelte';
	import { Button } from '$ui/button';
	import { goBack } from '$lib/utils/route.svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		/** 标题 */
		title: string;
		/** 主要信息内容 */
		message?: string | string[];
		footerBtnText?: string;
		footerBtnOnclick?: () => void;
	}

	const {
		title = '出错了',
		message = '',
		footerBtnText = '返回',
		footerBtnOnclick = goBack
	}: Props = $props();
</script>

<InfoCard {title} {message}>
	{#snippet header()}
		<X class="text-destructive h-12 w-12" />
	{/snippet}

	{#snippet footer()}
		<Button variant="secondary" onclick={footerBtnOnclick}>{footerBtnText}</Button>
	{/snippet}
</InfoCard>
