<template>
  <div class="header popup flex flex-col overflow-y-auto overflow-x-hidden w-fit max-w-[156px] h-fit select-none border-solid border-2">
    <div clas="flex flex-col w-fit h-fit">

      <div class="items-center contents-body flex flex-row" title="add underline">
        <div class="footerbar-button w-fit mt-2 mx-2 px-2 round-btn-style"
          @click="handdleUnderline"
        >
            underline
        </div>
        <div class="footerbar-button w-fit h-fit mt-2 mr-2 round-btn-style" title="del underline"
          @click="handdleRemoveAnnotation('underline')"
        >
          <IconWindowClose/>
        </div>
      </div>

      <div class="items-center contents-body flex flex-row" title="add highlight">
        <div class="footerbar-button w-fit mt-2 mx-2 p-2 round-btn-style"
          @click="handdleHighlight">
          <!-- :style="{'background-color': annotationColors[selectedColorIndex]}" -->
          highlight
        </div>
        <div class="footerbar-button w-fit h-fit mt-2 mr-2 round-btn-style" title="del highlight"
          @click="handdleRemoveAnnotation('highlight')"
        >
          <IconWindowClose/>
        </div>
      </div>

      <!-- <div class="items-center contents-body" title="mark">
        <div class="footerbar-button w-fit p-2 round-btn-style"
          @click="handdleMark"
        >
          ABC-mark
        </div>
      </div> -->

      <!-- <div class="items-center contents-body" title="remove">
        <div class="footerbar-button w-fit mt-2 mx-2 p-2 round-btn-style"
          @click="handdleRemoveAnnotation"
        >
          remove
        </div>
      </div> -->
    </div>

    <div class="w-full popup-sub border-solid border-t-2 my-2"></div>

    <div class="color-picker flex flex-wrap justify-center">
      <div
        v-for="(color, index) in annotationColors"
        :title="color"
        :key="index"
        :style="{ backgroundColor: color }"
        class="footerbar-button size-4 rounded-full basis-1/7"
        :selected="selectedColorIndex === index"
        @click="selectColor(index)"
      ></div>
    </div>

    <div class="w-full popup-sub border-solid border-t-2 my-2"></div>

    <div class="flex justify-center">
      <input type="color" class="size-6" id="annotationColorInput"/>
      <button @click="addColor" class="titlebar-button ml-2 w-fit p-2 round-btn-style">添加</button>
    </div>

    <div class="w-full popup-sub border-solid border-t-2 my-2"></div>

    <div class="flex justify-center">
      <button @click="delSelectedColor" class="titlebar-button w-fit p-2 mb-2 round-btn-style"> 删除颜色 </button>
    </div>

  </div>
</template>

<script>
import { IconNote } from "@/components/icons";
import IconWindowClose from "../icons/IconWindowClose.vue";

export default {
  name: "PopupAnnotation",
  components: {
    IconNote,
    IconWindowClose,
  },
  data() {
    return {
      annotationColors:["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#000000", "#FFFFFF",],
      showPopup: false,
      selectedColorIndex: 0,
    };
  },
  methods: {
    togglePopup() {
      this.showPopup = !this.showPopup;
    },
    emitApplyAnnotation(type) {
      this.$emit('apply-annotation', {type: type, color: this.annotationColors[this.selectedColorIndex]});
    },
    handdleUnderline() {
      this.emitApplyAnnotation("underline")
    },
    handdleHighlight() {
      this.emitApplyAnnotation("highlight");
    },
    handdleMark() {
      this.emitApplyAnnotation("mark");
    },
    handdleRemoveAnnotation(type) {
      this.$emit('remove-annotation', {type: type});
    },
    saveColors(){
      localStorage.setItem("annotation-colors", JSON.stringify(this.annotationColors));
    },
    selectColor(index) {
      this.selectedColorIndex = index;
      localStorage.setItem("annotation-selected-color-index", this.selectedColorIndex);
    },
    addColor() {
      // 获取annotationColorInput的值
      const color = document.getElementById("annotationColorInput").value;
      if (this.annotationColors.includes(color)) {
        alert("color already exists: \n    " + color);
      } else {
        this.annotationColors.push(color);
        this.saveColors();
      }
    },
    delSelectedColor() {
      this.annotationColors.splice(this.selectedColorIndex, 1);
      // 如果颜色足够多，删除一个颜色后，选中的颜色索引不变
      if (this.selectedColorIndex >= this.annotationColors.length) {
        this.selectedColorIndex = this.annotationColors.length - 1;
      } 
      this.saveColors();
    },
    initAnnotationColor() {
      const colorsStr = localStorage.getItem("annotation-colors");
      if (colorsStr && colorsStr.length != 2) {
        // console.log("initAnnotationColor, get colors from local storage");
        this.annotationColors = JSON.parse(colorsStr);
      } else {
        this.annotationColors = [
          "#FFFF00", "#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#000000", "#FFFFFF",
        ];
        localStorage.setItem("annotation-colors", JSON.stringify(this.annotationColors));
      }
    },
    initSelectedColorIndex() {
      let index = localStorage.getItem("annotation-selected-color-index");
      if (index) {
        this.selectedColorIndex = index;
      }
    },
  },
  beforeMount() {
    this.initAnnotationColor();
    this.initSelectedColorIndex();
  },
  // mounted() {
  // },
  beforeUnmount() {
    localStorage.setItem("annotation-selected-color-index", this.selectedColorIndex);
    localStorage.setItem("annotation-colors", JSON.stringify(this.annotationColors));
  }
};
</script>

<style scoped>
[selected=true] {
  border: 2px solid #5bbec3;
}
</style>