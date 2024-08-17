<template>
  <div
    class="footerbar footer z-[6000] flex justify-between items-center fixed bottom-0 left-0 right-0 h-6 select-none"
  >
    <!-- 左侧部分 -->
    <div class="left-section flex items-center">
      <!------主页: 致谢---阅读页: 空--------->
      <div
        v-if="curRouteNameIs('BookReader')"
      >
        <div id="footerbar-change-doc-width" class="footerbar-button" @click="toggleChangeDocWidthPopup">
          <IconDocumentWidth title="change doc width" />
          <PopupChangeDocWidth v-show="showChageDocPopup" class="bottom-7 left-12"/>
        </div>
      </div>
      <div v-else class="footerbar-content">
        <p>
          <a
            href="https://github.com/srsng/cozy-reader"
            target="_blank"
            class="underline"
            >Cozy-reader(Github)</a
          >
          | Made in China.
        </p>
      </div>
      <!---------------------------------------->
    </div>

    <!-- 中间部分 -->
    <div class="center-section flex items-center">
      <!---------主页：随机提示----阅读页：章节标题与切换按钮------->
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
          <!-- <p>{{ curBookChapter }}</p> -->
          <p>{{  }}</p>
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
        <p> {{ "// tips: " + randomTips() + " //" }}</p>
      </div>
      <!---------------------------------------->
    </div>

    <!-- 右侧部分 -->
    <div class="right-section flex items-center">
      <!---------主页：信息----阅读页：目录按钮------->
      <div v-if="curRouteNameIs('BookReader')" 
        class="footerbar-button toc"
        data-hs-overlay="#hs-overlay-right"
        aria-controls="hs-overlay-right"
        id="footerbar-contents">
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
} from "@/components/icons";
// import { goNext, goPrev } from "@/views/BookReader.vue";
import PopupChangeDocWidth from "@/components/popups/PopupChangeDocWidth.vue";
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
    PopupChangeDocWidth
  },
  computed: {
    ...mapState({
      curBookChapter: state => state.curBookChapter,
    }),
  },
  data() {
    return {
      showChageDocPopup: false,
    };
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
    randomTips() {
      const zh_cn = [
        "在主页可以直接拖入文件导入",
        // 有关阅读页面快捷键
        "阅读页面最左右两侧的区域可以点击翻页",
        "阅读页面可以使用方向键翻页",
        "阅读页面可以使用Home键跳转到章节开头",
        "阅读页面可以使用End键跳转到章节结尾",
        "阅读页面按下Esc键回到主页",
        "使用PageUp/PageDown键可以轻松阅读",
        // 有关阅读页面功能提示
        "书籍目录在阅读页面右下角打开",
        "阅读页面左下角的按钮可以调整阅读显示宽度",
        "标题栏第四个按钮可以刷新页面",
        "阅读页面宽度每次调整幅度为屏幕宽度的1/10",
        "阅读页面宽度最小为屏幕宽度的10%",
        "每次调整完阅读页面宽度后，需要刷新页面重新渲染",
        "出现弹窗后，再次点击按钮才会关闭弹窗",
      ];
      // const en_us = [];
      const tips = zh_cn;
      const tip = tips[Math.floor(Math.random() * tips.length)];
      return tip;
    },
  },
};
</script>

<style></style>
