<script lang="ts">
	import { Trash2Icon } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	const { book } = $props();
	const onOpen = () => {
		console.log(book);
		goto(`/reader/${book.fileName}`);
		// $emit('open-book', book.fileName);
	};
	const onDelete = () => {
		// $emit('delete-book', book.fileName);
	};

	const truncatedTitle = $derived.by(() => {
		if (book.title) {
			const colonIndex = book.title.indexOf(':');
			return colonIndex !== -1 ? book.title.slice(0, colonIndex).trim() : book.title;
		}
		return 'Untitled';
	});
</script>

<!-- todo -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="book-item group relative mb-0 h-fit select-none rounded-r-lg hover:cursor-pointer"
	onclick={onOpen}
	style:backgroundColor={book.color}
>
	<div class="transition duration-200 hover:bg-black/20">
		<div class="default-cover flex aspect-[3/4.5] w-full flex-col overflow-hidden rounded-r-lg">
			{#if book.coverUrl}
				<div>
					<img
						src={book.coverUrl}
						loading="lazy"
						alt="thumbnail"
						class=" from-transparent to-black/20 transition-shadow hover:bg-black/30 hover:shadow-lg"
					/>
					<div class="truncate p-1">
						{truncatedTitle}
					</div>
				</div>
			{:else}
				<div class=" p-4">
					<h2
						class="md:text-md tracking-snug text-base-content from-transparent to-black/20 text-xl font-semibold leading-snug hover:bg-black/30"
					>
						{truncatedTitle}
					</h2>
					{#if book.author && book.author !== 'Unknown Author'}
						<p
							class="md:text-md tracking-snug text-base-content text-xl font-semibold leading-snug"
						>
							{book.author}
						</p>
					{/if}
				</div>
			{/if}
		</div>

		<button
			onclick={onDelete}
			class="delete-icon bg-base-300 hover:bg-error hover:text-error-content absolute bottom-2 right-2 rounded-full p-2 opacity-0 transition duration-200 hover:opacity-100 group-hover:opacity-60"
		>
			<Trash2Icon></Trash2Icon>
		</button>
	</div>
</div>

<style>
</style>
