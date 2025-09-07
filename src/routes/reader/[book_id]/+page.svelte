<script lang="ts">
	import Markdown from '$lib/components/reader/markdown/Markdown.svelte';
	import { Image, Heading, Link, Strong, Blockquote } from '$lib/components/typography';
	// import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	// import { BookFormat } from '$lib/database/index.js';
	// import type { Component } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import { slide } from 'svelte/transition';

	const { data } = $props();

	const book = data.book;
	const markdownContent = data.markdownContent;

	// const bookReaderers: Record<BookFormat, Component> = {
	// 	[BookFormat.MARKDOWN]: Markdown<{ content: string }>,
	// 	[BookFormat.TXT]: Markdown,
	// 	[BookFormat.EPUB]: Markdown,
	// 	[BookFormat.PDF]: Markdown,
	// 	[BookFormat.HTML]: Markdown
	// };

	// 定义渲染器类型
	const renderers: Record<string, any> = {
		heading: Heading,
		image: Image,
		link: Link,
		strong: Strong,
		blockquote: Blockquote
	};
</script>

<div
	class="mx-auto w-full max-w-[60%] space-y-6 p-6 pt-8"
	role="main"
	oncontextmenu={(e) => e.stopPropagation()}
	transition:slide
>
	<div class="grid grid-cols-2 gap-4">
		<div class="book-reader">
			<!-- {@const BookReader = bookReaderers[book.format]}
			<BookReader content={markdownContent} /> -->

			<!-- {#if book.format === 'markdown'} -->
			<h1 class="align-center mb-6 text-3xl font-bold">gitbutler {book.title}</h1>
			<!-- <SvelteMarkdown source={markdownContent} {renderers} /> -->
			<Markdown content={markdownContent} />
			<!-- {:else if book.format === 'txt'}
			<pre class="whitespace-pre-wrap break-words">{markdownContent}</pre>
		{/if} -->
		</div>
		<div class="book-reader">
			<h1 class="align-center mb-6 text-3xl font-bold">sveltemd {book.title}</h1>
			<SvelteMarkdown source={markdownContent} {renderers} />
		</div>
	</div>
</div>

<style>
	/* .book-reader {
		line-height: 1.8;
	} */

	/* .book-reader :global(pre) {
		border-radius: 8px;
		padding: 1rem;
		margin: 1.5rem 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	} */
</style>
