<template>
  <div
    data-tauri-drag-region
    class="titlebar flex justify-between items-center fixed bottom-0 left-0 right-0 bg-teal-600 h-8 select-none"
  >
    <!-- 左侧部分 -->
    <div class="left-section flex items-center"></div>

    <!-- 中间部分 -->
    <div class="center-section flex items-center"></div>

    <!-- 右侧部分 -->
    <div class="right-section flex items-center">
      <div
        id="titlebar-minimize"
        class="titlebar-button flex justify-center items-center w-8 h-8 hover:bg-teal-400"
      >
        <img
          src="https://api.iconify.design/mdi:window-minimize.svg"
          alt="minimize"
        />
      </div>
      <div
        id="titlebar-maximize"
        class="titlebar-button flex justify-center items-center w-8 h-8 hover:bg-teal-400"
      >
        <img
          src="https://api.iconify.design/mdi:window-maximize.svg"
          alt="maximize"
        />
      </div>
      <div
        id="titlebar-close"
        class="titlebar-button flex justify-center items-center w-8 h-8 hover:bg-teal-400"
      >
        <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AppTitleBar",
};
</script>

<style></style>
