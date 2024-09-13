<template>
  <div>  
    <form id="add-theme-form">
      <div class="w-full flex items-center justify-start gap-2 my-2">
        <label for="theme-name-input">主题名: </label>
        <input type="text" id="theme-name-input" name="theme-name-input" placeholder="Blue | 蓝" class="w-40"/>
      </div>
      <div class="w-fit flex items-center justify-between">
        <!-- <div>theme-</div> -->
        <select id="theme-type" name="theme-type">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="both">Both</option>
        </select>
        <div>-</div>
        <input type="text" id="theme-color-name-input" placeholder="标识名:blue,只允许字母" class="w-fit max-w-42"/>
      </div>

      <div class="w-full popup-sub border-solid border-t-2 my-2"></div>
      
      <div class="w-full flex items-center justify-start gap-2">
        <label for="header-color-input" class="ml-1">Header Color:</label>
        <input type="color" id="header-color-input" name="header-color-input" />
      </div>
      <br />

      <div class="w-full flex items-center justify-start gap-2">
        <label for="background-color-input" class="ml-1">Background Color:</label><br>
        <input type="color" id="background-color-input" name="background-color-input" />
      </div>
      <br />
      
      <div class="w-full flex items-center justify-start gap-2">
        <label for="header-text-color-input" class="ml-1">Header Text Color:</label><br>
        <input type="color" id="header-text-color-input" name="header-text-color-input" />
      </div>
      <div>
        <input type="checkbox" id="header-text-color-checkbox" class="ml-1" @change="toggleHeaderTextColor">
        需要HeaderTextColor
      </div>
      <br>

      <div class="w-full flex items-center justify-start gap-2">
        <label for="other-text-color-input" class="ml-1">Other Text Color:</label><br>
        <input type="color" id="other-text-color-input" name="other-text-color-input" />
      </div>

      <div class="w-full popup-sub border-solid border-t-2 my-2"></div>

      <div class="w-full flex items-center justify-between mb-2">
        <div @click.stop="saveTheme" class="titlebar-button ml-4 w-fit p-2 rounded-md">保存主题</div>
        <div @click.stop="cancel" class="titlebar-button mr-4 w-fit p-2 rounded-md">取消添加</div>
      </div>
    </form>
  </div>
</template>
<script>
import { addTheme, themesMap } from "@/theme/theme.js";

export default {
  data() {
    return {
      isHeaderTextColorEnabled: false,
    };
  },
  methods: {
    saveTheme() {
      // 获取表单数据
      const themeName = document.getElementById("theme-name-input").value;
      // 如果themeName为空，提示用户输入
      if (themeName === "") {
        alert("请填写预填“Blue | 蓝”的输入框");
        return;
      }
      const themeColorName = document.getElementById("theme-color-name-input").value;
      // 如果为空，提示用户输入
      if (themeColorName === "") {
        alert("请填写预填“blue”的输入框");
        return;
      }
      // 如果不是字母，提示用户
      if (!/^[a-zA-Z]+$/.test(themeColorName)) {
        alert("表示名只允许英文字母(a-z, A-Z)");
        return;
      }
      // 如果已经存在该主题，提示用户
      if (themesMap[themeColorName]) {
        alert("该主题名称已存在");
        return;
      }

      const themeType = document.getElementById("theme-type").value;
      const headerColor = document.getElementById("header-color-input").value;
      const backgroundColor = document.getElementById("background-color-input").value;
      const headerTextColor = document.getElementById("header-text-color-input").value;
      const otherTextColor = document.getElementById("other-text-color-input").value;
      const isHeaderTextColorEnabled = this.isHeaderTextColorEnabled;

      const themeContent = {
        "name": themeColorName,
        "type": themeType,
        "css": {
          "--header-color": headerColor,
          "--background-color": backgroundColor,
          "--text-color": otherTextColor,
        },
      };

      if (isHeaderTextColorEnabled) {
        themeContent.css["--header-text-color"] = headerTextColor;
      }
      // 添加主题
      addTheme(`theme-${themeType}-${themeName}`, themeContent);
      console.log("add theme");
    },
    cancel() {
      document.getElementById("addTheme").click();
    },
    toggleHeaderTextColor(event) {
      this.isHeaderTextColorEnabled = event.target.checked;
    },
  },
};
</script>
<style>
.color-preview {
  width: 50px;
  height: 50px;
  border: 1px solid #000;
  display: inline-block;
}
</style>