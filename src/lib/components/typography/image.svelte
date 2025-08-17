<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/core';
	const { href, alt, title, ...other } = $props();
</script>

<img
	src={convertFileSrc(href)}
	alt={alt || "Image didn't load"}
	class="items-center justify-between"
	{title}
	loading="lazy"
	{...other}
/>
