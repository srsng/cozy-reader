<script lang="ts" module>
	import * as Card from '$lib/components/ui/card';
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		/** 卡片标题 */
		title: string;
		/** 主要信息内容 */
		message?: string | string[];
		/** 头部，可以放图标等 */
		header?: Snippet;
		/** footer 可以放按钮等 */
		footer?: Snippet;
	}
</script>

<script lang="ts">
	const { title, message, header, footer }: Props = $props();

	const messages = $derived.by(() => {
		if (!message) return [];
		if (Array.isArray(message)) return message;
		if (typeof message === 'string') {
			return message.split('\n\n').filter((msg) => msg.trim());
		}
		return [];
	});
</script>

<div class="flex min-h-screen items-center justify-center p-4" transition:slide>
	<Card.Root class="mx-auto w-full min-w-80 max-w-md">
		<Card.Content class="p-8">
			<div class="space-y-6 text-center">
				<div class="flex items-center justify-center">
					{@render header?.()}
				</div>

				<!-- 内容区域 -->
				<div class="space-y-3">
					<h2 class="text-foreground text-2xl font-bold">{title}</h2>

					{#if messages.length > 0}
						<div class="space-y-2">
							{#each messages as msg}
								<p class="text-muted-foreground text-sm leading-relaxed">{msg}</p>
							{/each}
						</div>
					{/if}
				</div>

				{@render footer?.()}
			</div>
		</Card.Content>
	</Card.Root>
</div>

<style></style>
