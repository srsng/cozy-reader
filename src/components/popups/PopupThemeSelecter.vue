<template>
  <div
    class="popup flex overflow-y-auto overflow-x-hidden flex-col w-64 h-96 select-none rounded-lg border-solid border-2"
    @click.stop
  >
    <header class="w-full flex items-center justify-between">
      <div class="pl-2">主题</div>
      <div>
        <div id="cycleTheme" class="titlebar-button">
          <IconCycle @click.stop="cycleTheme" />
        </div>
        <div id="exportThemes" class="titlebar-button">
          <IconExport @click.stop="exportThemes" />
        </div>
      </div>
    </header>
    <div class="w-full popup-sub border-solid border-t-2"></div>
    <div v-for="(theme, index) in themes" :key="index" class="w-full">
      <div
        :class="theme"
        class="popup-sub w-42 mx-2 mt-1 rounded-lg border-solid border-2"
      >
        <header
          class="w-full h-6 truncate flex items-center justify-between"
          :class="theme"
        >
          <div class="flex items-center pl-1">
            <IconMoon v-if="themesMap[theme].type === 'dark'" />
            <IconSun v-else-if="themesMap[theme].type === 'light'" />
            <IconSunMoon v-else />
            <span class="ml-2">{{ "theme " + (index + 1) }}</span>
            <div class="w-max h-fit titlebar-button rounded-full bg-[--background-color] ml-1">
              <IconYes class="text-[--text-color]" @click.stop="setTheme(theme)"/>
            </div>
          </div>
          <div class="w-max h-fit titlebar-button rounded-full bg-[--background-color]">
            <IconWindowClose class="text-[--text-color]" @click.stop="deleteTheme(theme)"/>
          </div>
        </header>
        <div
          :class="theme"
          class="contents-body w-full h-8 text-center rounded-b-lg"
        >
          {{ themesMap[theme].name }}
        </div>
      </div>
    </div>
    <div class="w-full popup-sub border-solid border-t-2 mt-2"></div>
    <div class="w-full flex items-center justify-between pl-2 header">
      新建主题 | New Theme
      <div id="addTheme" class="titlebar-button">
        <IconPlus @click.stop="toggleThemeAdderPopup"/>
      </div>
    </div>
    <div>
      <div class="ml-2">新建一个属于你的主题</div>
      <!-- <div class="w-full popup-sub border-solid border-t-2 my-2"></div> -->
      <PopupAddTheme v-show="showThemeAdderPopup" class="top-36 left-64 text-[--text-color]"/>
    </div>

    <div class="w-full popup-sub border-solid border-t-2 mb-2"></div>
    
    <div class="w-full flex items-center justify-between pl-2 header">
      导入主题 | Import Themes
      <div id="importThemes" class="titlebar-button">
        <IconImport @click.stop="importThemes" />
      </div>
    </div>
    <textarea id="import-teme-paste-area" class="min-h-8 w-full mx-1" @paste="handlePaste" placeholder=" 粘贴文本，自动导入."></textarea>

    <div class="w-full popup-sub border-solid border-t-2"></div>
    
  </div>
</template>

<script>
import { themes, themesMap, setTheme, cycleTheme, addTheme, deleteTheme, importThemes, exportThemes } from "@/theme/theme.js";
import {
  IconCycle,
  IconYes,
  IconPlus,
  IconSun,
  IconMoon,
  IconSunMoon,
  IconWindowClose,
  IconImport,
  IconExport,
} from "@/components/icons";
import PopupAddTheme from "@/components/popups/PopupAddTheme.vue";

export default {
  name: "PopupThemeSelecter",
  components: {
    IconCycle,
    IconYes,
    IconPlus,
    IconSun,
    IconMoon,
    IconSunMoon,
    IconWindowClose,
    IconImport,
    IconExport,
    PopupAddTheme,
  },
  data() {
    return {
      themes: themes,
      themesMap: themesMap,
      showThemeAdderPopup: false,
    };
  },
  methods: {
    setTheme,
    cycleTheme,
    addTheme,
    deleteTheme,
    importThemes,
    exportThemes,
    toggleThemeAdderPopup() {
      this.showThemeAdderPopup = !this.showThemeAdderPopup;
    },
    handlePaste(event) {
      // 获取粘贴的文本
      const pastedText = event.clipboardData.getData('text');
      console.log('Pasted text:', pastedText); // 调试输出

      // 调用 importThemes 函数
      importThemes(pastedText);
    },
  },
};
</script>
