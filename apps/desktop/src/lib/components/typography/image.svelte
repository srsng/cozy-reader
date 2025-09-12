<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/core';

	interface Props {
		href?: string;
		title?: string;
		text?: string;
	}

	const { href = '', title = undefined, text = '' }: Props = $props();
</script>

<img
	src={convertFileSrc(href)}
	{title}
	alt={text}
	class="items-center justify-between"
	loading="lazy"
/>
