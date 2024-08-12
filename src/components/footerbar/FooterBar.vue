<template>
    <div
      class="footerbar z-[6000] flex justify-between items-center fixed bottom-0 left-0 right-0 bg-teal-600 h-8 select-none"
    >
      <!-- 左侧部分 -->
      <div class="left-section flex items-center">
        <p> left </p>
        <div class="titlebar-button" @click="cycleTheme">
            <IconThemeChange title="chagen theme"/>
        </div>
      </div>
  
      <!-- 中间部分 -->
      <div class="center-section flex items-center">
        <p>footer bar</p>
      </div>
  
      <!-- 右侧部分 -->
      <div class="right-section flex items-center"> 
        <p>right</p>
      </div>
    </div>
  </template>
  
  <script>
import IconThemeChange from "@/components/icons/IconThemeChange.vue";
export default {
    name: "FooterBar",
    components: {
        IconThemeChange
    },
    methods: {
    },
};
</script>
  
<style></style>
  