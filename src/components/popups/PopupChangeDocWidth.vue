<template>
  <div 
  class="popup flex items-center border-solid border-2 select-none h-fit text-[--text-color]"
  >
    <div
      class="popup-button footerbar-button"
      id="increase-doc-width"
      @click.stop="increaseDocWidth"
    >
      <IconPlus title="increase doc width" />
    </div>
    <div class="popup-button footerbar-content" id="text-of-doc-width">
      {{ viewerWidth }}%
    </div>
    <div
      class="popup-button footerbar-button"
      id="decrease-doc-width"
      @click.stop="decreaseDocWidth"
    >
      <IconWindowMin title="decrease doc width" />
    </div>
  </div>
</template>

<script>
import {IconPlus, IconWindowMin} from "@/components/icons";
import { mapState } from 'vuex';

export default {
    name: "PopupsChangeDocWidth",
    components: {
        IconPlus,
        IconWindowMin,
    },
    computed: {
    ...mapState({
      viewerWidth: state => state.viewerWidth
    })
  },
    methods: {
        increaseDocWidth() {
            this.$store.commit("increaseViewerWidth");
        },
        decreaseDocWidth() {
            this.$store.commit("decreaseViewerWidth");
        },
    }
}
</script>
