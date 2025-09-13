<script lang="ts" module>
	import { writeClipboard } from '$lib/backend/clipboard';
	import { Button } from '$ui/button';
	import { Link } from 'lucide-svelte';
	import * as Tooltip from '$ui/tooltip';
	import type { Snippet } from 'svelte';

	// function isLocalLink(href: string) {
	// 	return href.startsWith('./') || href.startsWith('/');
	// }

	// todo: 链接处理
	function handleClick(e: MouseEvent, href: string) {
		console.log('a.click', e);
		e.stopPropagation();
		// 按住 Ctrl键 点击链接跳转
		if (!e.ctrlKey) {
			writeClipboard(href, { message: '链接已复制', description: '按住 Ctrl键 点击链接以跳转' });
			e.preventDefault();
		}
	}

	type Props = { href: string; children: Snippet };
</script>

<script lang="ts">
	const { href, children }: Props = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button variant="link">
				<Link class="text-secondary" />
				<a {href} target="_blank" rel="noopener noreferrer" onclick={(e) => handleClick(e, href)}>
					{@render children()}
				</a>
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{href}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
