<template>
  <div
    class="book-item group overflow-hidden relative hover:cursor-pointer hover:shadow-lg transition-shadow rounded-r-lg hover:bg-black/30 "
    
    @click="$emit('open-book', book.fileName)"
    :style="{backgroundColor: book.color}"
  >
    <div class="hover:bg-black/20 transition duration-200 ">
      <div class="default-cover w-full aspect-[3/4.5] rounded-r-lg flex flex-col overflow-hidden bg-gradient-to-b from-transparent to-black/20">
        <div class=" p-4">
        <h2 class="font-semibold text-xl md:text-md tracking-snug leading-snug text-white">{{ truncatedTitle }}</h2>
        <p v-if="book.author && book.author !== 'Unknown Author'" class="text-xl md:text-md tracking-snug leading-snug font-semibold text-black">{{ book.author }}</p>
      </div>
      </div>
      <button
        @click.stop="$emit('delete-book', book.fileName)"
        class="opacity-0 group-hover:opacity-100 transition duration-200 delete-icon absolute bottom-2 right-2 p-2 rounded-full bg-white hover:bg-white/50"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookThumbnail',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  computed: {
    truncatedTitle() {
      if (this.book.title) {
        const colonIndex = this.book.title.indexOf(':');
        return colonIndex !== -1 ? this.book.title.slice(0, colonIndex).trim() : this.book.title;
      }
      return 'Untitled';
    }
  }
}
</script>