<template>
  <div
    class="popup flex overflow-y-auto flex-col w-48 h-96 select-none rounded-lg border-solid border-2"
    @click.stop
  >
    <div class="header flex w-full">
      <div id="cycleTheme" class="titlebar-button">
        <IconCycle @click.stop="cycleTheme" />
      </div>
      <span class="items-center">Cycle to Next theme</span>
    </div>
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
          <div class="flex items-center">
            <IconMoon v-if="themesMap[theme].type === 'dark'" />
            <IconSun v-else-if="themesMap[theme].type === 'light'" />
            <IconSunMoon v-else />
            <span class="ml-2">{{ "theme " + (index + 1) }}</span>
          </div>
          <div
            class="w-max h-fit titlebar-button rounded-full bg-[--background-color]"
            @click.stop="setTheme(theme)"
          >
            <IconYes class="text-[--text-color]" />
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
  </div>
</template>

<script>
import { themes, themesMap, setTheme, cycleTheme } from "@/theme/theme.js";
import {
  IconCycle,
  IconYes,
  IconSun,
  IconMoon,
  IconSunMoon,
} from "@/components/icons";

export default {
  name: "PopupThemeSelecter",
  components: {
    IconCycle,
    IconYes,
    IconSun,
    IconMoon,
    IconSunMoon,
  },
  data() {
    return {
      themes: themes,
      themesMap: themesMap,
    };
  },
  methods: {
    setTheme,
    cycleTheme,
  },
};
</script>
