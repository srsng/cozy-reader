<template>
  <div
    class="footerbar footer z-[6000] flex justify-between items-center fixed bottom-0 left-0 right-0 h-6 select-none overflow-visible text-ellipsis whitespace-nowrap"
    @contextmenu.prevent
  >
    <!-- 左侧部分 -->
    <div class="left-section flex items-center">
      <!------阅读页: 调整页宽按钮与弹窗--------->
      <div v-if="curRouteNameIs('BookReader')">
        <div id="footerbar-reader-setter" class="footerbar-button" @click="toggleReaderSetterPopup">
          <IconDocumentWidth title="reader setter" />
          <PopupReaderControler v-show="showReaderSetterPopup" class="bottom-10 left-36"/>
        </div>
      </div>
      <!------主页: 致谢---阅读页: 调整页宽--------->
      <div v-else class="footerbar-content truncate">
        <p>
          <a
            href="https://github.com/srsng/cozy-reader"
            target="_blank"
            class="underline"
            >Cozy-Reader(Github)</a
          >
          | Made in China.
        </p>
      </div>
      <!---------------------------------------->
    </div>

    <!-- 中间部分 -->
    <div class="center-section flex justify-center items-center overflow-hidden truncate border-x-2 border-[--background-color]">
      <!---------主页：随机提示----阅读页：章节标题与切换按钮------->
      <!-- 阅读页 -->
      <div
        v-if="curRouteNameIs('BookReader')"
        class="flex justify-between items-center"
      >
        <div id="footerbar-to-top" class="footerbar-button" @click="scrollToTop">
          <IconToTop title="go to top" />
        </div>
        <div id="footerbar-prev" class="footerbar-button" @click="goPrev">
          <IconLeftArrow title="previous" />
        </div>
        <div id="chapter-title" class="footerbar-content center-content truncate">
          <!-- <p>{{ curBookChapter }}</p> -->
          <p>{{  }}</p>
        </div>
        <div id="footerbar-next" class="footerbar-button" @click="goNext">
          <IconRightArrow title="next" />
        </div>
        <div id="footerbar-to-bottom" class="footerbar-button" @click="scrollToBottom">
          <IconToBottom title="go to bottom" />
        </div>
      </div>
      <!-- 主页 -->
      <div v-else class="footerbar-content flex items-center truncate">
        <div id="footerbar-home-random-tips">
          <p> {{ "// tips: " + randomTips() + " //" }}</p>
        </div>
      </div>
      <!---------------------------------------->
    </div>

    <!-- 右侧部分 -->
    <div class="right-section flex items-center">
      <!---------主页：信息----阅读页：目录按钮------->
      <div v-if="curRouteNameIs('BookReader')" 
        class="footerbar-button toc flex items-center"
        data-hs-overlay="#hs-overlay-right"
        aria-controls="hs-overlay-right"
        id="footerbar-contents">
        <IconContents title="toggle Contents" />
      </div>
      <div v-else class="footerbar-content flex items-center">
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
import PopupReaderControler from "@/components/popups/PopupReaderControler.vue";
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
    PopupReaderControler,
  },
  computed: {
    ...mapState({
      curBookChapter: state => state.curBookChapter,
    }),
  },
  data() {
    return {
      showReaderSetterPopup: false,
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
    toggleReaderSetterPopup() {
      this.showReaderSetterPopup = !this.showReaderSetterPopup;
    },
    randomTips() {
      const zh_cn = [
        "在主页可以直接拖入文件导入",
        // 有关阅读页面快捷键
        "阅读页面最左右两侧的区域可以点击翻页",
        "阅读页面可以使用Home键跳转到章节开头",
        "阅读页面可以使用End键跳转到章节结尾",
        "阅读页面按下Esc键回到主页",
        "使用PageUp/PageDown键可以轻松阅读",
        "想要搜索？试试 Ctrl+F",
        "阅读时想要快速翻页？试试方向键",
        // 有关阅读页面功能提示
        "书籍目录在阅读页面右下角打开",
        "阅读页面左下角的按钮可以调整阅读显示宽度",
        "标题栏第四个按钮可以刷新页面",
        "阅读页面宽度每次调整幅度为屏幕宽度的1/10",
        "阅读页面宽度最小为屏幕宽度的10%",
        "每次调整完阅读页面宽度后，需要刷新页面重新渲染",
        "出现弹窗后，再次点击按钮才会关闭弹窗",
        "有时书籍标题太长没法移动窗口，试试右上角第一个按钮",
        "在阅读页面左右部分区域可以点击翻页",
        "当你已经到达页底2s时，且鼠标光标在点击翻页区，再向下滚动也可以翻页",
      ];
      // const en_us = [];
      const tips = zh_cn;
      const tip = tips[Math.floor(Math.random() * tips.length)];
      return tip;
    },
  },
};
</script>

<style> </style>
