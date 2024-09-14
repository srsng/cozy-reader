<template>
  <div class="z-0">
    <div
      id="viewer"
      class="scrolled ml-auto mr-auto my-20"
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

      <div class="contents-body overflow-y-auto h-full p-4 pt-6 pb-16">
        <ul id="toc" class="space-y-2">
          <!-- <button @click="conslelogToc">click for dev</button> -->
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
// import { Store } from "@tauri-apps/plugin-store";

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
      atBottom: false,
      scrollTimeout: null,
    };
  },
  methods: {
    handleScroll() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const atBottom = scrollTop + windowHeight === scrollHeight;
      if (atBottom) {
        // this.atBottom = true;
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          this.atBottom = true;
        }, 2000);
      } else {
        this.atBottom = false;
      }
    },
    handleWheel(event) {
      if (this.atBottom && event.deltaY > 0) {
        this.goNext();
        this.atBottom = false;
        clearTimeout(this.scrollTimeout);
      }
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
        // 当img标签是其父p或div元素的唯一子元素，且父元素不包含文本时，设置其样式
        this.modifyIndependentImg(doc);
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
        p[independentImg] {
          margin-top: 1em;
          margin-bottom: 1em;
          max-width: 90%;
          height: auto;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
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

    modifyIndependentImg(doc) {
      const imgs = doc.getElementsByTagName("img");
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        const parent = img.parentNode;
        // 对于所有img标签的父标签，如果是p标签或div标签，且p或div标签只包含img标签且不包含文本，则为img设置属性indepndentImg
        if (parent && (parent.nodeName === "P" || parent.nodeName === "DIV")) {
          const children = parent.childNodes;
          console.log("children",i, children);
          if (children.length === 1 && children[0].nodeName === "IMG") {
            parent.setAttribute("independentImg", "");
          } 
          // 或者，父标签内存在且只存在一段文本, 文本与img标签顺序不定
          else if (children.length === 2) {
            if (children[0].nodeName === "IMG" && children[1].nodeName === "#text") {
              parent.setAttribute("independentImg", "");
            } else if (children[0].nodeName === "#text" && children[1].nodeName === "IMG") {
              parent.setAttribute("independentImg", "");
            }
            
          }
        }
      }
      
    },

    goNext(event) {
      if( event ) {event.preventDefault();}
      this.rendition.next().then(this.setChapterTitle);
    },

    goPrev(event) {
      if( event ) {event.preventDefault();}
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
      // document.body.classList.add("overflow-hidden");
      // console.log("openSidebar");
    },

    closeSidebar() {
      // Use the third-party library to close the sidebar
      // console.log("closeSidebar");
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
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('wheel', this.handleWheel);

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

  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("beforeunload", this.saveCurrentLocation);

    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('wheel', this.handleWheel);
    clearTimeout(this.scrollTimeout);
  },
};
</script>

<style scoped> </style>
