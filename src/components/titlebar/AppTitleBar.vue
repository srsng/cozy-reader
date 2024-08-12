<template>
  <div
    data-tauri-drag-region
    class="titlebar z-[6000] flex justify-between items-center fixed top-0 left-0 right-0 bg-teal-600 h-8 select-none"
  >
    <!-- 左侧部分 -->
    <div class="left-section flex items-center">
      <div class="titlebar-button" @click="cycleTheme">
        <IconThemeChange title="chagen theme" />
      </div>
      <div @click="triggerUpload" class="upload-button titlebar-button">
        <BookAdder @upload-books="handleFileChange" />
        <IconAddBook title="add books" />
      </div>
    </div>

    <!-- 中间部分 -->
    <div class="center-section flex items-center">
      <p>title</p>
    </div>

    <!-- 右侧部分 -->
    <div class="right-section flex items-center">
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
import ExitButton from "@/components/common/ExitButton.vue";
import { cycleTheme } from "@/theme/theme.js";
import {
  IconWindowMin,
  IconWindowMax,
  IconWindowClose,
  IconThemeChange,
  IconAddBook,
} from "@/components/icons";
import BookAdder from "@/components/common/BookAdder.vue";

export default {
  name: "AppTitleBar",
  components: {
    ExitButton,
    IconWindowMin,
    IconWindowMax,
    IconWindowClose,
    IconThemeChange,
    IconAddBook,
    BookAdder,
  },
  methods: {
    triggerUpload() {
      document.getElementById("bookInput").click();
    },
    handleFileChange(event) {
      // this.$emit('upload-books', event);
      console.log("handleFileChange not ok now");
    },
    cycleTheme,
  },
};
</script>

<style></style>
