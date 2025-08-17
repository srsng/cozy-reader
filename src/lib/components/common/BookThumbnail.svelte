<script lang="ts">
  import { Trash2Icon } from "lucide-svelte";
  import { goto } from "$app/navigation";
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
      const colonIndex = book.title.indexOf(":");
      return colonIndex !== -1
        ? book.title.slice(0, colonIndex).trim()
        : book.title;
    }
    return "Untitled";
  });
</script>

<div
  class="book-item group mb-0 h-fit relative hover:cursor-pointer  rounded-r-lg select-none"
  onclick={onOpen}
  style:backgroundColor={book.color}
>
  <div class="hover:bg-black/20 transition duration-200">
    <div
      class="default-cover w-full aspect-[3/4.5] rounded-r-lg flex flex-col overflow-hidden"
    >
      {#if book.coverUrl}
        <div>
          <img src={book.coverUrl} loading="lazy" alt="thumbnail" class=" hover:bg-black/30 hover:shadow-lg transition-shadow from-transparent to-black/20"/>
          <div class="truncate p-1">
            {truncatedTitle}
          </div>
        </div>
      {:else}
        <div class=" p-4">
          <h2
            class="font-semibold text-xl md:text-md tracking-snug leading-snug text-base-content  hover:bg-black/30 from-transparent to-black/20"
          >
            {truncatedTitle}
          </h2>
          {#if book.author && book.author !== "Unknown Author"}
            <p
              class="text-xl md:text-md tracking-snug leading-snug font-semibold text-base-content"
            >
              {book.author}
            </p>
          {/if}
        </div>
      {/if}
    </div>

    <button
      onclick={onDelete}
      class="opacity-0 group-hover:opacity-60 hover:opacity-100 transition duration-200 delete-icon absolute bottom-2 right-2 p-2 rounded-full bg-base-300 hover:bg-error hover:text-error-content"
    >
      <Trash2Icon></Trash2Icon>
    </button>
  </div>
</div>

<style>
</style>
