<template>
  <div ref="scrollContainer" class="scroll-container">
    <div
      id="viewer"
      class="scrolled ml-auto mr-auto mb-20"
      :class="{ hidden: isResizing}"
      :style="{ 'max-width': viewerWidth + '%' }"
    ></div>

    <div
      @click="goPrev"
      id="go-prev"
      class="select-none text-transparent fixed top-0 left-0 h-[95vh] w-1/6 bg-transparent flex flex-col hover:cursor-pointer"
    >
      Prev
    </div>

    <div
      @click="goNext"
      id="go-next"
      class="select-none text-transparent fixed top-0 right-0 h-[95vh] w-1/6 bg-transparent flex flex-col hover:cursor-pointer"
    >
      Next
    </div>

    <div
      id="hs-overlay-right"
      class="contents-container py-8 hidden fixed top-0 end-0 h-full max-w-xl w-fit z-[4800] border-l-2 border-[--header-color]"
      tabindex="-1"
    >
      <div class="contents-header header flex justify-between items-center py-3 px-4 border-b">
        <h3 class="font-bold">Contents</h3>
        <!-- <button
          type="button"
          class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent"
          data-hs-overlay="#hs-overlay-right"
        >
          <span class="sr-only">Close modal</span>
          <svg
            class="flex-shrink-0 size-8 sm:size-6"
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
        </button> -->
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
import { mapState } from 'vuex';
import { HSOverlay } from 'preline';

export default {
  name: "BookReader",
  components: { },
  computed: {
    ...mapState({
      viewerWidth: state => state.viewerWidth,
      curBookTitle: state => state.curBookTitle,
    })
  },
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
      scrollTimer: null,
      bottomTimer: null,
      // viewerWidth: null
    };
  },
  methods: {
    handleScroll(event) {
      console.log("scroll");
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer);
      }

      this.scrollTimer = setTimeout(() => {
        const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
        console.log("bottom", bottom);
        if (bottom) {
          if (!this.bottomTimer) {
            this.bottomTimer = setTimeout(() => {
              this.goNext();
              this.bottomTimer = null; // 重置定时器
            }, 2000); // 2秒的延迟时间
          }
        } else {
          if (this.bottomTimer) {
            clearTimeout(this.bottomTimer);
            this.bottomTimer = null;
          }
        }
      }, 100); // 100ms 的延迟时间，可以根据需要调整
    },
    getChapterTitle() {
      try {
        // 获取当前章节的 CFI
        const cfi = this.rendition.currentLocation().start.cfi;
        // 获取当前章节的信息
        const currentChapter = this.book.spine.get(cfi);
        // 对于当前章节，获取第一个h标签
        const firstHeading = currentChapter.document.querySelector("h1, h2, h3, h4, p b");
        // console.log("firstHeading", firstHeading);
        if (firstHeading) {
          const title1 = firstHeading.title;
          const title2 = firstHeading.textContent;
          // 如果title1、title2有一个为空，则取另一个；如果两个都非空，则取长度较长的那个
          if (title1 && title2) {
            return title1.length > title2.length ? title1 : title2;
          }
        return title1 || title2;
        }
      } catch {
        return null;
      }
    },
    setChapterTitle() {
      const chapterTitle = this.getChapterTitle();
      this.$store.commit("setCurBookChapter", chapterTitle);

      // console.log("chapterTitle", chapterTitle);
      const eleChapterTitle = document.getElementById("chapter-title");
      // console.log(eleChapterTitle);
      if(eleChapterTitle) { eleChapterTitle.textContent = chapterTitle; }
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
          // const bookTitle = document.getElementById("book-title");
          this.$store.commit("setCurBookTitle", truncatedTitle);
          // if(bookTitle) { bookTitle.textContent = truncatedTitle; }
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
      } else if (event.key === 36) {
        // "Home"
        document.getElementById("footerbar-to-top").click();
      } else if (event.key === 35) {
        // "End"
        document.getElementById("footerbar-to-bottom").click();
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
        table *[bgcolor] { background-color: var(--background-color); filter: brightness(0.8);}
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
      this.rendition.next().then(this.setChapterTitle);
    },

    goPrev(event) {
      event.preventDefault();
      this.rendition.prev().then(this.setChapterTitle);
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
          localforage.setItem(
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
    initViewerWidth() {
      // this.viewerWidth = this.$store.state.viewerWidth;
    },

    // initContentsBtn() {
    //   const contentsBtn = document.querySelector('#footerbar-contents');
    //   // 为目录按钮绑定事件
    //   contentsBtn.addEventListener('click', () => {
    //     // 如果contents-container包含类slide-left，则移除，否则加入
    //     const contents = document.querySelector('#hs-overlay-right');
    //     if (contents.classList.contains('slide-left')) {
    //       contents.classList.remove('slide-left');
    //     } else {
    //       contents.classList.add('slide-left');
    //     }
    //   });

    //   // const modal = new HSOverlay(document.querySelector('#hs-overlay-right'));
    //   // console.log(modal);
    //   // const el = HSOverlay.getInstance('#hs-overlay-right');
    //   // openBtn.addEventListener('click', () => {
    //   //   el.on('open', (instance) => {});
    //   // });
    // }
    
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
    viewerWidth(newWidth) {
      localStorage.setItem("viewerWidth", newWidth);
    }

  },

  mounted() {
    // init theme
    initTheme();
    // this.initViewerWidth();

    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("beforeunload", this.saveCurrentLocation);
    this.$refs.scrollContainer.addEventListener('scroll', this.handleScroll);

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
      this.loadBook().then(this.setChapterTitle);
    }

    // this.initContentsBtn();
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("beforeunload", this.saveCurrentLocation);

    this.$refs.scrollContainer.removeEventListener('scroll', this.handleScroll);
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }
    if (this.bottomTimer) {
      clearTimeout(this.bottomTimer);
    }
  },
};
</script>

<style scoped>
/* Tailwind classes are used instead of custom styles */
.slide-left {
	-webkit-animation: slide-left 0.5s cubic-bezier(0.0250, 0.0460, 0.450, 0.940) both;
	        animation: slide-left 0.5s cubic-bezier(0.0250, 0.0460, 0.450, 0.940) both;
}

 @-webkit-keyframes slide-left {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
  }
  100% {
    -webkit-transform: translateX(-100px);
            transform: translateX(-100px);
  }
}
@keyframes slide-left {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
  }
  100% {
    -webkit-transform: translateX(-100px);
            transform: translateX(-100px);
  }
}

</style>
