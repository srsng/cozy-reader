<!-- HomeView.vue -->
<template>
  <div class="flex flex-col min-h-screen pt-8 bg-transparent">
    <!-- <AppHeader @upload-books="uploadBooks" @cycle-theme="cycleTheme"></AppHeader> -->
    <div class="drop flex-grow w-full" @dragover.prevent @drop="uploadBooks">
      <div class="content w-full px-4 sm:px-6">
        <div v-if="books.length === 0" @click="triggerUpload" class="pt-6">
          <p class="text-xl font-semibold pb-2">Your library is empty.</p>
          <p class="pb-3">
            Drop a DRM-free Epub here or click 'Add books' to get started.
          </p>
        </div>

        <div
          id="bookCatalog"
          class="grid grid-cols-6 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6 py-6"
        >
          <BookThumbnail
            v-for="(book, index) in books"
            class="select-none"
            :key="index"
            :book="book"
            @open-book="openBook"
            @delete-book="deleteBook"
          />
        </div>
        <!-- <div class="invisible size-1" id="home-book-adder" @click="uploadBooks"></div> -->
      </div>
    </div>

    <AlertToast
      v-show="showAlert"
      :message="alertMessage"
      @close="showAlert = false"
      class="pt-8"
    />
  </div>
</template>

<script>
import ePub from "epubjs";
import AppFooter from "@/components/common/Footer.vue";
import BookThumbnail from "@/components/common/BookThumbnail.vue";
import AlertToast from "@/components/common/AlertToast.vue";
import localforage from "localforage";
import AppHeader from "@/components/common/Header.vue";
import { initTheme, cycleTheme } from "@/theme/theme.js";
import { mapState, mapMutations } from 'vuex';

export default {
  name: "HomeView",
  components: {
    AppHeader,
    AppFooter,
    BookThumbnail,
    AlertToast,
  },
  data() {
    return {
      books: [],
      colors: [
        "#BC5377",
        "#B04C63",
        "#B25564",
        "#C15859",
        "#BF6150",
        "#C76849",
        "#C57140",
        "#C68245",
        "#D0953E",
        "#DAB062",
        "#D9AB60",
        "#C4AC58",
        "#B6AC56",
        "#B0BB6D",
        "#969F68",
        "#83A86B",
        "#69A076",
        "#5CA58A",
        "#47938F",
        "#3C8585",
        "#6B7096",
      ],
      showAlert: false,
      alertMessage: "",
    };
  },
  mounted() {
    initTheme();
  },
  computed: {
    ...mapState(['uploadBooksStatus']),
  },
  watch: {
    'uploadBooksStatus.uploading'(newVal) {
      if (newVal && !this.uploadBooksStatus.solving) {
        this.uploadBooksStatus.solving = true;
        this.uploadBooks(this.uploadBooksStatus.event).then(() => {
          this.setUploadBooksStatus({ uploading: false, solving: false, event: null });
        });
      }
    }
  },
  methods: {
    cycleTheme,
    initTheme,
    ...mapMutations(['setUploadBooksStatus']),
    handleFileChange(event) {
      this.$emit("upload-books", event);
    },
    getRandomColor() {
      return this.colors[Math.floor(Math.random() * this.colors.length)];
    },
    async uploadBooks(event) {
      event.preventDefault();
      const files = Array.from(
        event.dataTransfer ? event.dataTransfer.files : event.target.files
      );
      const duplicateTitles = [];
      const errorFiles = [];

      for (let file of files) {
        try {
          const bookData = await new Response(file).arrayBuffer();
          const book = ePub(bookData);
          await book.loaded.metadata;
          // console.log("Home.book: ", book);
          const metadata = await book.loaded.metadata;
          const title = metadata.title || "Untitled";

          // Check if a book with the same title already exists
          const existingBook = this.books.find(
            (b) => b.title.toLowerCase() === title.toLowerCase()
          );
          if (existingBook) {
            duplicateTitles.push(title);
            continue; // Skip to the next file
          }

          let coverUrl = null;
          if (book.cover) {
            try {
              coverUrl = await book.archive.createUrl(book.cover);
            } catch (error) {
              console.error(`Error creating URL for book cover: ${error}`);
            }
          }

          const bookInfo = {
            fileName: file.name,
            title: title,
            author: metadata.creator || "",
            coverUrl: coverUrl,
            color: this.getRandomColor(),
          };

          // Store both book data and info in the same object
          await localforage.setItem(file.name, {
            data: bookData,
            info: bookInfo,
          });
          // await invoke('plugin:store|set', { key: file.name, value: { data: bookData, info: bookInfo } });
          // todo: store.set
          // this.store.set(file.name, { data: bookData, info: bookInfo });
          this.books.push(bookInfo);

          console.log(`Successfully added ${file.name} to the library.`);
        } catch (error) {
          console.error(`Error processing file "${file.name}":`, error);
          errorFiles.push(file.name);
        }
      }

      // Show alert for duplicate titles
      if (duplicateTitles.length > 0) {
        const message =
          duplicateTitles.length === 1
            ? `"${duplicateTitles[0]}" already exists in your library.`
            : `The following books already exist in your library: ${duplicateTitles.join(
                ", "
              )}`;
        this.showAlertMessage(message);
      }

      // Show alert for error files
      if (errorFiles.length > 0) {
        const message =
          errorFiles.length === 1
            ? `Unable to process "${errorFiles[0]}". It may not be a valid EPUB file.`
            : `Unable to process the following files: ${errorFiles.join(
                ", "
              )}. They may not be valid EPUB files.`;
        this.showAlertMessage(message);
      }
    },
    openBook(fileName) {
      this.$router.push({ name: "BookReader", params: { fileName } });
    },
    async deleteBook(fileName) {
      await localforage.removeItem(fileName);
      // await invoke('plugin:store|remove', { key: fileName });
      // todo: store.remove
      // await this.store.delete(fileName);
    },
    showAlertMessage(message) {
      this.alertMessage = message;
      this.showAlert = true;
    },
  },
  async created() {
    const keys = await localforage.keys();
    // const keys = await invoke('plugin:store|keys');
    // todo: store.keys
    // const keys = await this.store.keys();
    for (const key of keys) {
      try {
        const bookItem = await localforage.getItem(key);
        // const bookItem = await invoke('plugin:store|get', { key });
        // todo: store.get
        // const bookItem = await this.store.get(key);
        if (bookItem && bookItem.info) {
          this.books.push(bookItem.info);
        }
      } catch (error) {
        console.error(`Error loading book "${key}":`, error);
      }
    }
  },
};
</script>

<style scoped>
/* Styles remain unchanged */
</style>
