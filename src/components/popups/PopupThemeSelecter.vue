<template>
  <div
    class="popup flex fixed overflow-y-auto flex-col w-48 h-96 select-none rounded-lg border-solid border-2"
    @click.stop
  >
    <div class="header flex w-full">
      <div id="cycleTheme" class="titlebar-button">
        <IconCycle @click.stop="cycleTheme" />
      </div>
      <span class="items-center" >Cycle to Next theme</span>
    </div>
    <div class="w-full popup-sub border-solid border-t-2"></div>
    <div v-for="(theme, index) in themes" :key="index" class="w-full">
      <div
        :class="theme"
        class="popup-sub w-42 mx-2 mt-1 rounded-lg border-solid border-2"
      >
        <header class="w-full h-6 truncate" :class="theme">
          {{ "theme " + (index + 1) }}
          <div class="w-max h-fit titlebar-button rounded-full bg-[--background-color]" @click.stop="setTheme(theme)">
            <IconYes/>
          </div>
        </header>
        <div :class="theme" class="contents-body w-full h-8 text-center rounded-b-lg">
          {{ theme }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { themes, setTheme, cycleTheme } from "@/theme/theme.js";
import { IconCycle, IconYes } from "@/components/icons";

export default {
  name: "PopupThemeSelecter",
  components: {
    IconCycle,
    IconYes,
  },
  data() {
    return {
      themes: themes,
    };
  },
  methods: {
    setTheme,
    cycleTheme,
  },
};
</script>
