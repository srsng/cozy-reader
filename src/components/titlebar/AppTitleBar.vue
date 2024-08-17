<template>
  <div
    data-tauri-drag-region
    class="titlebar header z-[6000] flex justify-between items-center fixed top-0 left-0 right-0 h-8 select-none"
  >
    <!-- 左侧部分 -->
    <div class="left-section flex items-center">
      <div id="titlebar-home" class="titlebar-button" @click="goHome">
        <IconHome title="Home" />
      </div>
      <div id="titlebar-changeTheme" class="titlebar-button" @click="toggleThemeSelecterPopup">
        <IconThemeChange title="change Theme" />
        <PopupThemeSelecter v-if="showThemeSelecterPopup" class="top-9 left-36"/>
      </div>
      <div id="titlebar-addBooks" @click="triggerUpload" class="upload-button titlebar-button">
        <BookAdder @change="handleFileChange"/>
        <IconAddBook title="add books" />
      </div>
      <div id="titlebar-fresh" class="titlebar-button" @click="refreshPage">
        <IconRefresh title="refresh" />
      </div>
    </div>

    <!-- 中间部分 -->
    <div class="center-section flex-grow flex justify-center items-center overflow-hidden">
      <div  id="app-title"  class="center-content truncate">
        <!-- title maybe too long to let right buttons show in right case -->
        <p>{{ appTitle }}</p>
      </div>
    </div>

    <!-- 右侧部分 -->
    <div class="right-section flex items-center">
      <!-- absolute right-0 -->
      <div id="titlebar-minimize" class="titlebar-button">
        <IconWindowMin title="minmize" />
      </div>
      <div id="titlebar-maximize" class="titlebar-button">
        <IconWindowMax title="maximize" />
      </div>
      <div id="titlebar-close" class="titlebar-button">
        <IconWindowClose title="close" />
      </div>
    </div>
  </div>
</template>

<script>
import { cycleTheme } from "@/theme/theme.js";
import {
  IconWindowMin,
  IconWindowMax,
  IconWindowClose,
  IconThemeChange,
  IconAddBook,
  IconHome,
  IconRefresh,
} from "@/components/icons";
import BookAdder from "@/components/common/BookAdder.vue";
import PopupThemeSelecter from "@/components/popups/PopupThemeSelecter.vue";
import { mapMutations, mapState } from 'vuex';

export default {
  name: "AppTitleBar",
  components: {
    IconWindowMin,
    IconWindowMax,
    IconWindowClose,
    IconThemeChange,
    IconAddBook,
    BookAdder,
    IconHome,
    IconRefresh,
    PopupThemeSelecter,
  },
  data() {
    return {
      appTitle: "Cozy Reader",
      showThemeSelecterPopup: false,
    };
  },
  computed: {
    ...mapState({
      curBookTitle: state => state.curBookTitle,
    })
  },
  // props: {
  //   appTitle: {
  //     type: String,
  //     default: "Cozy Reader",
  //     required: true,
  //   },
  // },
  watch: {
    $route(to) {
      if (to.name === "Home") {
        this.appTitle = "Cozy Reader";
      }
    },
    curBookTitle(bookTitle) {
      this.appTitle = bookTitle;
    },
  },
  methods: {
    ...mapMutations(['setUploadBooksStatus']),
    goHome() {
      this.$router.push({ name: "Home" });
    },
    triggerUpload() {
      if (this.$route.name === "Home") {
        document.getElementById("book-adder").click();
      }
    },
    handleFileChange(event) {
      // this.$emit("upload-books", event);
      this.setUploadBooksStatus({ uploading: true, solving: false, event: event, });
    },
    refreshPage() {
      this.$router.go(0);
    },
    cycleTheme,
    toggleThemeSelecterPopup() {
      console.log("toggleThemeSelecterPopup");
      this.showThemeSelecterPopup = !this.showThemeSelecterPopup;
    },
  },
};
</script>

<style></style>
