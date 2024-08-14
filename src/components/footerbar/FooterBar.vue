<template>
  <div
    class="footerbar z-[6000] flex justify-between items-center fixed bottom-0 left-0 right-0 h-6 select-none"
  >
    <!-- 左侧部分 -->
    <div class="left-section flex items-center">
      <!------主页致谢---阅读页: 空--------->
      <div
        v-if="curRouteNameIs('BookReader')"
      >
        <div id="footerbar-change-doc-width" class="footerbar-button" @click="toggleChangeDocWidthPopup">
          <IconDocumentWidth title="change doc width" />
          <div v-show="showChageDocPopup" class="popup flex items-center bottom-7 left-12">
            <div class="popup-button footerbar-button" id="increase-doc-width" @click.stop="increaseDocWidth">
              <IconPlus title="increase doc width" />
            </div>
            <div class="popup-button footerbar-content" id="text-of-doc-width">{{ viewerWidth }}%</div>
            <div class="popup-button footerbar-button" id="decrease-doc-width" @click.stop="decreaseDocWidth">
              <IconWindowMin title="decrease doc width" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="footerbar-content">
        <p>
          <a
            href="https://github.com/srsng/cozy-reader"
            target="_blank"
            class="underline"
            >Github</a
          >
          | Made in China.
        </p>
      </div>
      <!---------------------------------------->
    </div>

    <!-- 中间部分 -->
    <div class="center-section flex items-center">
      <!---------主页：空----阅读页：章节标题与切换按钮------->
      <div
        v-if="curRouteNameIs('BookReader')"
        class="flex justify-between items-center"
      >
        <div
          id="footerbar-to-top"
          class="footerbar-button"
          @click="scrollToTop"
        >
          <IconToTop title="go to top" />
        </div>
        <div id="footerbar-prev" class="footerbar-button" @click="goPrev">
          <IconLeftArrow title="previous" />
        </div>
        <div id="chapter-title" class="footerbar-content">
          <p>{{}}</p>
        </div>
        <div id="footerbar-next" class="footerbar-button" @click="goNext">
          <IconRightArrow title="next" />
        </div>
        <div
          id="footerbar-to-bottom"
          class="footerbar-button"
          @click="scrollToBottom"
        >
          <IconToBottom title="go to bottom" />
        </div>
      </div>
      <div v-else class="footerbar-content">
        <!-- 空 -->
      </div>
      <!---------------------------------------->
    </div>

    <!-- 右侧部分 -->
    <div class="right-section flex items-center">
      <!---------主页：信息----阅读页：目录按钮------->
      <div v-if="curRouteNameIs('BookReader')" 
        class="footerbar-button toc"
        data-hs-overlay="#hs-overlay-right"
        id="titlebar-contents">
        <IconContents title="toggle Contents" />
      </div>
      <div v-else class="footerbar-content">
        <p>
          Based on
          <a
            href="https://github.com/MattKevan/minimal-reader/"
            target="_blank"
            class="underline"
            >Minimal-Reader</a
          >
          by
          <a href="https://www.kevan.tv" target="_blank" class="underline"
            >Matt Kevan</a
          >.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  IconContents,
  IconLeftArrow,
  IconRightArrow,
  IconToTop,
  IconToBottom,
  IconDocumentWidth,
  IconPlus,
  IconWindowMin,
} from "@/components/icons";
// import { goNext, goPrev } from "@/views/BookReader.vue";
import { mapState } from 'vuex';


export default {
  name: "FooterBar",
  components: {
    IconContents,
    IconLeftArrow,
    IconRightArrow,
    IconToTop,
    IconToBottom,
    IconDocumentWidth,
    IconPlus,
    IconWindowMin,
  },
  data() {
    return {
      showChageDocPopup: false,
    };
  },
  computed: {
    ...mapState({
      viewerWidth: state => state.viewerWidth
    })
  },
  methods: {
    curRouteNameIs(name) {
      return this.$route.name === name;
    },
    goNext() {
      const next = document.getElementById("go-next");
      if (next) {
        next.click();
      }
    },
    goPrev() {
      const prev = document.getElementById("go-prev");
      if (prev) {
        prev.click();
      }
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 平滑滚动
      });
    },
    scrollToBottom() {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth", // 平滑滚动
      });
    },
    toggleChangeDocWidthPopup() {
      this.showChageDocPopup = !this.showChageDocPopup;
    },
    increaseDocWidth() {
      this.$store.commit("increaseViewerWidth");
    },
    decreaseDocWidth() {
      this.$store.commit("decreaseViewerWidth");
    },
  },
};
</script>

<style></style>
