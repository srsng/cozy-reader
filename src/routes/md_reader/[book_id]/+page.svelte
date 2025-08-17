<script>
	import { invoke } from '$lib/backend/ipc.js';
	import { Image, Heading } from '$lib/components/typography';
	import SvelteMarkdown from 'svelte-markdown';
	// import page from '$app/paths'

	const { data } = $props();
	console.log(data);
	const bookid = data.book_id;
	const path = data.books[bookid];
	// max-w-[${$userSettings.reader.viewerWidth}%]
	function handleParsed(event) {
		//access tokens via event.detail.tokens
		console.log(event.detail.tokens);
	}
</script>

<div class="mx-auto w-full max-w-[60%] select-none space-y-6 p-6">
	<!-- <div class="flex items-center justify-between"> -->
	<!-- <div class="space-y-2">
			<h2 class="text-2xl font-bold">设置</h2>
			<p class="text-muted-foreground">管理应用程序的设置选项</p>
		</div>

		<div class="flex items-center gap-2">
			<UtilButton.back className="size-9" size="icon" variant="default" />
			<UtilButton.home className="size-9" size="icon" variant="outline" />
		</div> -->
	{#await invoke('read_markdown_file', { path })}
		loading...
	{:then source}
		<div class="markdown-reader">
			<SvelteMarkdown
				{source}
				renderers={{ heading: Heading, image: Image }}
				on:parsed={handleParsed}
			/>
		</div>
	{:catch e}
		error to render book: {e}
	{/await}
</div>
