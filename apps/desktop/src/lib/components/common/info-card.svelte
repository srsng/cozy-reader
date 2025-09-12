<script lang="ts" module>
	import * as Card from '@cozy/ui/card';
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		/** 卡片标题 */
		title: string;
		/** 主要信息内容 */
		message?: string | string[];
		/** 头部，可以放图标等 */
		header?: Snippet;
		/** 主体内容 */
		body?: Snippet;
		/** footer 可以放按钮等 */
		footer?: Snippet;
	}
</script>

<script lang="ts">
	const { title, message, header, body, footer }: Props = $props();

	const messages: string[] = $derived.by(() => {
		if (!message) return [];
		if (typeof message === 'string') {
			return message.split('\n\n').filter((msg) => msg.trim());
		}
		if (Array.isArray(message)) return message;
		return [];
	});
</script>

<div class="flex max-h-full min-h-full items-center justify-center" transition:slide>
	<Card.Root class="mx-auto w-full min-w-80 max-w-md">
		<Card.Content class="p-8">
			<div class="space-y-6">
				<div class="flex items-center justify-center">
					{@render header?.()}
				</div>

				<!-- 内容区域 -->
				<div class="space-y-3 text-center">
					<h2 class="text-foreground text-2xl font-bold">{title}</h2>

					<div class="space-y-2" class:hidden={messages.length === 0}>
						{#each messages as msg}
							<p class="text-muted-foreground text-sm leading-relaxed">{msg}</p>
						{/each}
					</div>
				</div>

				<div>
					{@render body?.()}
				</div>

				<div class="text-center">
					{@render footer?.()}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<style></style>
