<script lang="ts">
	import { Image, Heading } from '$lib/components/typography';
	import SvelteMarkdown from 'svelte-markdown';
	import { slide } from 'svelte/transition';

	const { data } = $props();

	const book = data.book;
	const markdownContent = data.markdownContent;

	// 定义渲染器类型
	const renderers: Record<string, any> = {
		heading: Heading,
		image: Image
	};
</script>

<div
	class="mx-auto w-full max-w-[60%] space-y-6 p-6 pt-8"
	role="main"
	oncontextmenu={(e) => e.stopPropagation()}
	transition:slide
>
	<div class="markdown-reader">
		<h1 class="align-center mb-6 text-3xl font-bold">{book.title}</h1>
		<SvelteMarkdown source={markdownContent} {renderers} />
	</div>
</div>

<style>
	/* 优化阅读体验的样式 */
	.markdown-reader {
		line-height: 1.8;
	}

	.markdown-reader :global(p) {
		margin-bottom: 1.5rem;
		text-align: justify;
	}

	.markdown-reader :global(h1),
	.markdown-reader :global(h2),
	.markdown-reader :global(h3),
	.markdown-reader :global(h4),
	.markdown-reader :global(h5),
	.markdown-reader :global(h6) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		scroll-margin-top: 2rem;
	}

	.markdown-reader :global(img) {
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease;
	}

	/* .markdown-reader :global(img:hover) {
		transform: scale(1.02);
	} */

	.markdown-reader :global(pre) {
		border-radius: 8px;
		padding: 1rem;
		margin: 1.5rem 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.markdown-reader :global(blockquote) {
		border-left: 4px solid var(--color-primary);
		padding-left: 1rem;
		margin: 1.5rem 0;
		font-style: italic;
		background: rgba(0, 0, 0, 0.02);
		padding: 1rem;
		border-radius: 0 8px 8px 0;
	}
</style>
