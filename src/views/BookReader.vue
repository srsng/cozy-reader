<template>
  <header class="sticky top-0 z-[3000] w-full backdrop-blur-md text-sm pt-8">
    <nav
      class="flex items-center justify-between px-6 py-1"
      aria-label="Global"
    >
      <div class="flex items-center select-none space-x-4">
          <!-- 主页按钮 -->
          
          <!-- 退出程序按钮 -->

      </div>
      <!-- 标题 -->
      <div class="flex-grow text-center">
        <div id="book-title" class="font-bold text-lg" @click="$emit('content-change')"></div>
      </div>
        <!-- 主题切换按钮与目录按钮 -->
        <!-- <div class="flex items-center select-none space-x-4">
        <div>
          <svg
            class="size-8 sm:size-6 fill-current cursor-pointer hover:text-blue-600"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1793"
          >
            <path
              d="M398.336 407.210667c58.709333 0 106.154667 47.104 106.154667 105.472s-47.786667 105.472-106.154667 105.472-106.154667-47.104-106.154667-105.472 47.445333-105.472 106.154667-105.472m0-51.882667c-87.381333 0-158.037333 70.314667-158.037333 157.013333s70.656 157.013333 158.037333 157.013334c87.381333 0 158.037333-70.314667 158.037333-157.013334s-70.997333-157.013333-158.037333-157.013333zM398.336 175.104c-14.336 0-25.941333 11.605333-25.941333 25.941333v86.357334c0 14.336 11.605333 25.941333 25.941333 25.941333s25.941333-11.605333 25.941333-25.941333V201.045333c-0.341333-14.336-11.946667-25.941333-25.941333-25.941333zM129.024 329.728c-8.874667 0-17.749333 4.778667-22.528 12.970667-7.168 12.288-3.072 28.330667 9.557333 35.498666l74.752 43.008c4.096 2.389333 8.533333 3.413333 12.970667 3.413334 8.874667 0 17.749333-4.778667 22.528-12.970667 7.168-12.288 3.072-28.330667-9.557333-35.498667L141.994667 333.141333c-4.096-2.048-8.533333-3.413333-12.970667-3.413333zM203.093333 597.333333c-4.437333 0-8.874667 1.024-12.970666 3.413334l-74.752 43.008c-12.288 7.168-16.725333 22.869333-9.557334 35.498666 4.778667 8.192 13.653333 12.970667 22.528 12.970667 4.437333 0 8.874667-1.024 12.970667-3.413333l74.752-43.008c12.288-7.168 16.725333-22.869333 9.557333-35.498667-5.12-8.533333-13.653333-12.970667-22.528-12.970667zM396.970667 709.973333c-14.336 0-25.941333 11.605333-25.941334 25.941334v86.357333c0 14.336 11.605333 25.941333 25.941334 25.941333s25.941333-11.605333 25.941333-25.941333v-86.357333c-0.341333-14.336-11.605333-25.941333-25.941333-25.941334z"
              p-id="1794"
            ></path>
            <path
              d="M629.077333 228.010667c126.976 4.437333 234.496 124.586667 240.298667 268.970666 3.413333 84.992-26.282667 166.912-81.578667 224.597334-44.032 45.738667-100.010667 72.362667-159.744 75.093333 81.237333-65.536 132.096-170.666667 132.437334-284.330667 0.682667-114.005333-49.834667-219.136-131.413334-284.330666m-7.168-51.882667c-31.744 0-62.464 5.461333-91.136 15.701333-17.749333 6.144-34.474667 14.336-50.517333 23.893334 17.408 2.730667 34.133333 7.509333 50.517333 13.994666 104.106667 41.301333 178.858667 152.234667 178.517334 282.624-0.341333 130.389333-75.434667 241.664-179.882667 283.648-16.042667 6.485333-33.109333 11.264-50.517333 14.336 16.042667 9.557333 32.768 17.408 50.517333 23.552 28.330667 9.898667 58.368 15.018667 89.429333 15.018667h0.682667c171.349333-0.341333 309.589333-160.426667 302.08-353.621333-7.168-173.738667-136.533333-314.709333-292.522667-318.805334-2.730667-0.341333-5.12-0.341333-7.168-0.341333z"
            ></path>
          </svg>
        </div>
        <button class="toc bg-no-repeat" data-hs-overlay="#hs-overlay-right">
          <svg
            class="size-8 sm:szie-6 cursor-pointer hover:text-blue-600"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M106.666667 192a21.333333 21.333333 0 1 0 0 42.666667h85.333333a21.333333 21.333333 0 0 0 0-42.666667H106.666667z m0 298.666667a21.333333 21.333333 0 0 0 0 42.666666h85.333333a21.333333 21.333333 0 0 0 0-42.666666H106.666667z m0 298.666666a21.333333 21.333333 0 0 0 0 42.666667h85.333333a21.333333 21.333333 0 0 0 0-42.666667H106.666667zM320 192a21.333333 21.333333 0 0 0 0 42.666667h597.333333a21.333333 21.333333 0 0 0 0-42.666667H320z m0 298.666667a21.333333 21.333333 0 0 0 0 42.666666h597.333333a21.333333 21.333333 0 0 0 0-42.666666H320z m0 298.666666a21.333333 21.333333 0 0 0 0 42.666667h597.333333a21.333333 21.333333 0 0 0 0-42.666667H320z"
            ></path>
          </svg>
        </button>
        </div> -->
    </nav>
  </header>

  <div
    id="viewer"
    class="scrolled max-w-4xl ml-auto mr-auto mb-20"
    :class="{ hidden: isResizing }"
  ></div>

  <div
    @click="goPrev"
    id="go-prev"
    class="select-none fill-current text-transparent fixed top-0 left-0 h-screen w-12 lg:w-20 bg-transparent flex flex-col hover:cursor-pointer bg-no-repeat bg-[center_left_12px]"
  >
    Prev
  </div>

  <div
    @click="goNext"
    id="go-next"
    class="select-none fill-current text-transparent fixed top-0 right-0 h-screen w-12 lg:w-20 bg-transparent flex flex-col hover:cursor-pointer bg-no-repeat bg-[center_right_12px]"
  >
    Next
  </div>

  <div
    id="hs-overlay-right"
    class="contents-header py-8 hs-overlay hs-overlay-open:translate-x-0 hidden translate-x-full fixed top-0 end-0 transition-all duration-300 transform h-full max-w-xs w-full z-[4800] border-s"
    tabindex="-1"
  >
    <div class="flex justify-between items-center py-3 px-4 border-b">
      <h3 class="font-bold">Contents</h3>
      <button
        type="button"
        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent"
        data-hs-overlay="#hs-overlay-right"
      >
        <span class="sr-only">Close modal</span>
        <svg
          class="flex-shrink-0 size-8 sn:size-6"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    </div>

    <div class="contents-body overflow-y-auto h-full p-4 py-6">
      <ul id="toc" class="space-y-2">
        <button @click="conslelogToc">click for dev</button>
        <li v-for="(chapter, index) in toc" :key="index">
          <a
            href="#"
            @click.prevent="displayChapter(chapter.href, true)"
            class="text-blue-500 hover:text-blue-700"
          >
            {{ chapter.label }}
          </a>
          <div
            class="px-4"
            v-for="sub_chapter in chapter.subitems"
            :key="sub_chapter.id"
          >
            <a
              href="#"
              @click.prevent="displayChapter(sub_chapter.href, true)"
              class="text-blue-500 hover:text-blue-700"
            >
              {{ sub_chapter.label }}
            </a>
            <div
              class="px-8"
              v-for="sub_sub_chapter in sub_chapter.subitems"
              :key="sub_sub_chapter.id"
            >
              <a
                href="#"
                @click.prevent="displayChapter(sub_sub_chapter.href, true)"
                class="text-blue-500 hover:text-blue-700"
              >
                {{ sub_sub_chapter.label }}
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ePub from "epubjs";
import localforage from "localforage";
import {
  getThemesStr,
  getCurrentTheme,
  initTheme,
} from "@/theme/theme";


export default {
  name: "BookReader",
  components: { },
  props: {
    fileName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      book: null,
      rendition: null,
      toc: [],
      resizeTimeout: null,
      isResizing: false,
    };
  },
  methods: {
    getChapterTitle() {
      // 获取当前章节的 CFI
      const cfi = this.rendition.currentLocation().start.cfi;
      // 获取当前章节的信息
      const currentChapter = this.book.spine.get(cfi);
      // 对于当前章节，获取第一个h标签
      const firstHeading = currentChapter.document.querySelector("h1, h2, h3, h4");
      if (firstHeading) {
        const title1 = firstHeading.title;
        const title2 = firstHeading.textContent;
        // 如果title1、title2有一个为空，则取另一个；如果两个都非空，则取长度较长的那个
        if (title1 && title2) {
          return title1.length > title2.length ? title1 : title2;
        }
      return title1 || title2;
      }
    },
    setChapterTitle() {
      const cTitle = document.getElementById("chapter-title")
      const title = this.getChapterTitle();
      console.log("title", title);
      if (cTitle) cTitle.textContent = title;
    },
    conslelogToc() {
      console.log("book", this.book);
      console.log("rendition", this.rendition);
      this.setChapterTitle();
    },
    async loadBook() {
      try {
        const bookItem = await localforage.getItem(this.fileName);
        // const bookItem = await Store.getItem(this.fileName);
        if (bookItem && bookItem.data) {
          this.book = ePub(bookItem.data);

          this.rendition = this.book.renderTo("viewer", {
            flow: "scrolled-doc",
            width: "100%",
            height: "100%",
            fullsize: true,
            enableSwipe: false,
          });
          
          this.defineHooks();
          await this.loadTOC();
          await this.displayBook();

          // Set the book title
          const metadata = await this.book.loaded.metadata;
          const fullTitle = metadata.title;
          const truncatedTitle = fullTitle.split(":")[0].trim();
          const bookTitle = document.getElementById("book-title");
          if(bookTitle) { bookTitle.textContent = truncatedTitle; }
        } else {
          console.error("Book not found in local storage or invalid book data");
          this.$router.push({ name: "Home" });
        }
      } catch (error) {
        console.error("Error loading book:", error);
        this.$router.push({ name: "Home" });
      }
    },

    handleKeydown(event) {
      if (event.key === "ArrowLeft") {
        this.goPrev(event);
      } else if (event.key === "ArrowRight") {
        this.goNext(event);
      } else if (event.key === "Escape") {
        this.goHome();
      }
    },

    defineHooks() {
      this.book.rendition.hooks.content.register((contents) => {
        let doc = contents.document;
        let head = doc.querySelector("head");

        // Remove existing stylesheets
        Array.from(
          head.querySelectorAll('link[rel="stylesheet"], style')
        ).forEach((el) => el.remove());

        // Modify links
        const links = doc.querySelectorAll("a");
        links.forEach((link) => {
          const href = link.getAttribute("href");
          if (href) {
            if (href.startsWith("http://") || href.startsWith("https://")) {
              // External link: open in new tab
              link.setAttribute("target", "_blank");
            } else {
              // Internal link: remove href and make it non-clickable
              link.removeAttribute("href");
              link.style.textDecoration = "none";
              link.style.color = "inherit";
              link.style.cursor = "text";
            }
          }
        });

        // Inject minimal Tailwind styles
        let style = doc.createElement("style");
        style.textContent = this.getMinimalTailwindStyles();
        head.appendChild(style);

        // Remove empty paragraphs
        var paras = doc.getElementsByTagName("p");
        for (var i = paras.length - 1; i >= 0; i--) {
          if (paras[i].innerHTML.replace(/\s|&nbsp;/g, "").length == 0)
            paras[i].parentNode.removeChild(paras[i]);
        }
        // Convert all-caps headings to sentence case
        this.convertAllCapsHeadings(doc);

        // 对于连续2个及以上的br标签组，剔除一个
        this.removeExtraBrTags(doc);
        // 修改blockquote与table内部的字体大小
        this.modifyBlockquoteAndTable(doc);

        // Add Tailwind-like typography classes to body
        doc.body.classList.add("prose", "mx-auto", "px-4", getCurrentTheme());

        // Apply dark mode styles
        // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        //   doc.body.classList.add('dark');
        // }
      });

      this.rendition.on("relocated", (location) => {
        localStorage.setItem(
          `epub-location-${this.fileName}`,
          location.start.cfi
        );
      });
    },
    convertAllCapsHeadings(doc) {
      const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((heading) => {
        if (this.isAllCaps(heading.textContent)) {
          heading.textContent = this.toSentenceCase(heading.textContent);
        }
      });
    },

    isAllCaps(text) {
      return text === text.toUpperCase() && text !== text.toLowerCase();
    },

    toSentenceCase(text) {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    handleInternalLink(href) {
      if (href.startsWith("#")) {
        // It's an anchor within the current chapter
        this.rendition.display(href);
      } else {
        // It's a link to another chapter
        const item = this.book.spine.get(href);
        if (item) {
          this.rendition.display(item.href);
        } else {
          console.error(`Unable to find item for href: ${href}`);
        }
      }
    },

    getMinimalTailwindStyles() {
      return (
        `
        @import url('https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .prose { 
          font-family: 'Gentium Book Plus', sans-serif; 
          font-size: 20px;
          line-height: 180%;
          color: var(--text-color);
        }
        .prose p { margin-bottom: 1em; }
        .prose h1, .prose h2, .prose h3, .prose h4 { 
          margin-top: 1.5em; 
          margin-bottom: 0.5em; 
          font-weight: 700; 
          text-align: center;
        }
        .prose h1 { font-size: 2.25em; line-height: 120%; }
        .prose h2 { font-size: 1.5em; line-height: 120%;}
        .prose h3 { font-size: 1.25em; line-height: 120%;}
        .prose h4 { font-size: 1.2em; line-height: 120%;}
        .prose strong {font-weight: 700; }
        .prose a { color: #6eaadc; text-decoration: none; }
        a:hover { text-decoration: underline; cursor: pointer; }
        .prose ul, .prose ol { margin-top: 1em; margin-bottom: 1em; padding-left: 1.5em; }
        .prose li { margin-bottom: 0.25em; }
        .prose li p { margin: 0;}
        .prose img { 
          margin-top: 1em; margin-bottom: 1em; 
          width: 80%;
          height: 100%;
          margin-left:auto;
          margin-right:auto;}

        blockquote {
          border-left: 10px solid var(--text-color);
          margin: 1.5em 10px;
          padding: 0.5em 10px;
          quotes: "\\201C""\\201D""\\2018""\\2019";
        }
        blockquote:before {
          color: var(--text-color);
          content: open-quote;
          font-size: 4em;
          line-height: 0.1em;
          margin-right: 0.25em;
          vertical-align: -0.4em;
        }
        blockquote br {
          content: "";
          display: block;
          line-height: 0.5em;
        }
        blockquote * {
          display: inline;
        }
        [bgcolor], body { background: transparent;}
      ` + getThemesStr()
      );
    },

    modifyBlockquoteAndTable(doc) {
      const fonts = doc.querySelectorAll("table font, blockquote font");
      fonts.forEach((element) => {
        const size = element.getAttribute("size");
        if (size) {
          element.setAttribute("size", parseInt(size) > 1 ? 5 : 4);
        }
      });
    },

    removeExtraBrTags(doc) {
      const brs = doc.getElementsByTagName("br");
      let count = 0;

      for (let i = brs.length - 1; i >= 0; i--) {
        if (brs[i].nextSibling && brs[i].nextSibling.nodeName === "BR") {
          count++;
          if (count >= 1) {
            brs[i].parentNode.removeChild(brs[i]);
          }
        } else {
          count = 0;
        }
      }
    },

    goNext(event) {
      event.preventDefault();
      this.rendition.next();
    },

    goPrev(event) {
      event.preventDefault();
      this.rendition.prev();
    },

    async loadTOC() {
      const navigation = await this.book.loaded.navigation;
      this.toc = navigation.toc;
    },

    async displayBook() {
      try {
        const savedLocation = localStorage.getItem(
          `epub-location-${this.fileName}`
        );
        const currentSectionIndex = savedLocation || undefined;
        await this.rendition.display(currentSectionIndex);
      } catch (error) {
        console.error("Error displaying book:", error);
      }
    },

    saveCurrentLocation() {
      if (this.rendition) {
        const currentLocation = this.rendition.currentLocation();
        if (currentLocation && currentLocation.start) {
          localStorage.setItem(
            `epub-location-${this.fileName}`,
            currentLocation.start.cfi
          );
        }
      }
    },

    displayChapter(href) {
      if (this.rendition) {
        this.closeSidebar();
        this.rendition.display(href);
      }
    },

    openSidebar() {
      document
      .getElementById("toc-sidebar")
      .classList.remove("translate-x-full");
      document.getElementById("overlay").classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      console.log("openSidebar");
    },

    closeSidebar() {
      // Use the third-party library to close the sidebar
      console.log("closeSidebar");
      if (window.HSOverlay) {
        window.HSOverlay.close(document.querySelector("#hs-overlay-right"));
      } else {
        console.warn(
          "HSOverlay not found. Make sure the library is properly loaded."
        );
      }
    },

    goHome() {
      this.$router.push({ path: "/" });
    },

    handleFileInput(e) {
      var file = e.target.files[0];
      if (file.type !== "application/epub+zip") {
        alert("Please select an EPUB file.");
        return;
      }
    },
  },

  watch: {
    fileName: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.loadBook();
        }
      },
      immediate: true,
    },
  },

  mounted() {
    // init theme
    initTheme();

    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("beforeunload", this.saveCurrentLocation);

    if (!this.fileName) {
      const savedFileName = localStorage.getItem("currentBook");
      if (savedFileName) {
        this.$router.replace({
          name: "BookReader",
          params: { fileName: savedFileName },
        });
      } else {
        this.$router.push({ name: "Home" });
      }
    } else {
      localStorage.setItem("currentBook", this.fileName);
      this.loadBook();
    }
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("beforeunload", this.saveCurrentLocation);
  },
};
</script>

<style scoped>
/* Tailwind classes are used instead of custom styles */
</style>
