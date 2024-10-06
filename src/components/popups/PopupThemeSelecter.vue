<template>
  <div
    class="popup flex overflow-y-auto overflow-x-hidden flex-col w-64 max-w-[90vw] h-96 max-h-[80vh] select-none rounded-lg border-solid border-2"
    @click.stop
    title=""
  >
    <header class="w-full flex items-center justify-between">
      <div class="pl-2">主题 | Themes</div>
      <div>
        <div id="cycleTheme" class="titlebar-button" title="cycle to the next theme">
          <IconCycle @click.stop="cycleTheme" />
        </div>
        <div id="exportThemes" class="titlebar-button mr-1" title="export themes to clipboard">
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
          <div class="flex items-center pl-1" title="theme type">
            <IconMoon v-if="themesMap[theme].type === 'dark'" title="dark theme"/>
            <IconSun v-else-if="themesMap[theme].type === 'light'" title="light theme"/>
            <IconSunMoon v-else  title="universal theme"/>
            <span class="ml-2" title="theme index">{{ "theme " + (index + 1) }}</span>
            <div class="w-max h-fit titlebar-button rounded-full bg-[--background-color] ml-1" title="select this theme">
              <IconYes class="text-[--text-color]" @click.stop="setTheme(theme)"/>
            </div>
          </div>
          <div class="w-max h-fit titlebar-button rounded-full bg-[--background-color]" title="delete this theme">
            <IconWindowClose class="text-[--text-color]" @click.stop="deleteTheme(theme)"/>
          </div>
        </header>
        <div
          :class="theme"
          class="contents-body w-full h-8 text-center rounded-b-lg"
          title="theme name"
        >
          {{ themesMap[theme].name }}
        </div>
      </div>
    </div>
    <div class="w-full popup-sub border-solid border-t-2 mt-2"></div>
    <div class="w-full flex items-center justify-between pl-2 header" title="">
      新建主题 | New Theme
      <div id="addTheme" class="titlebar-button round-btn-style mr-1">
        <IconPlus @click.stop="toggleThemeAdderPopup" title="create a new theme"/>
      </div>
    </div>
    <div>
      <div class="ml-2 text-[--text-color]">创建一个属于你的主题</div>
      <!-- <div class="w-full popup-sub border-solid border-t-2 my-2"></div> -->
      <PopupAddTheme v-show="showThemeAdderPopup" class="top-36 left-64 text-[--text-color]"/>
    </div>

    <div class="w-full popup-sub border-solid border-t-2 mb-2"></div>
    
    <div class="w-full flex items-center justify-between pl-2 header" title="">
      导入 | Import
      <div id="importThemes" class="titlebar-button round-btn-style mr-1" title="import themes by texts">
        <IconImport @click.stop="importThemes" />
      </div>
    </div>
    <textarea id="import-teme-paste-area" class="min-h-8 w-full mx-1" @paste="handlePaste" placeholder=" 粘贴文本，自动导入." title=""></textarea>

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
