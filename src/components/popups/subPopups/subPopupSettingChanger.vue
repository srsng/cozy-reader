<template>
  <div
    class="flex items-center select-none h-fit contents-body round-btn-style"
  >
    <div
      class="popup-button footerbar-button rounded-l-md"
      @click.stop="increaseVal"
    >
      <IconPlus title="increase" />
    </div>
    <div class="popup-button footerbar-content">
      {{ value + theUnits }}
    </div>
    <div
      class="popup-button footerbar-button rounded-r-md"
      @click.stop="decreaseVal"
    >
      <IconWindowMin title="decrease" />
    </div>
  </div>
</template>

<script>
import { IconPlus, IconWindowMin } from "@/components/icons";

export default {
  name: "subPopupSettingChanger",
  components: {
    IconPlus,
    IconWindowMin,
  },
  props: {
    value: {
      type: Number,
    },
    units: {
      type: String,
    },
  },
  data() {
    return {
      theUnits: this.units,
    };
  },
  methods: {
    logValue() {
      console.log("value", this.value);
    },
    increaseVal() {
      this.$emit("value-change", { type: "increase", value: this.value });
    },
    decreaseVal() {
      this.$emit("value-change", { type: "decrease", value: this.value });
    },
  },
};
</script>
