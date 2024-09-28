// import { Store } from "@tauri-apps/plugin-store";
// const store = new Store("theme_store.bin");
import localforage from "localforage";
// import { saveAppWindowState } from ".";
// 默认主题Map
import defaultThemesMap from "./theme.json";
// 主题Map
// 内部值不带分号;
const themesMap = await initThemeStore();
const themes = Object.keys(themesMap);

async function initThemeStore() {
  // const themesMap = await store.get("app-theme");
  const themesMap = await localforage.getItem("app-theme");

  // 需要重置为默认值的情况：不存在该键, 值为空{}或者该键的值无法序列化
  if (!themesMap || typeof themesMap !== "object") {
    resetThemeStore();
    return defaultThemesMap;
  }
  return themesMap;
}

function refreshPage() {
  saveAppWindowState();
  document.querySelector("#titlebar-fresh").click();
}

function getCurrentTheme() {
  const savedTheme = localStorage.getItem("currTheme");
  if (savedTheme && themes.includes(savedTheme)) {
    return savedTheme;
  }
  return themes[0];
}

// 通过字符串设置主题
function setTheme(theme) {
  if (themes.includes(theme)) {
    document.body.classList.remove(...themes);
    document.body.classList.add(theme);
    localStorage.setItem("currTheme", theme);

    const iframe = document.querySelector("#viewer iframe");
    if (iframe) {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      iframeDocument.body.classList.remove(...themes);
      iframeDocument.body.classList.add(theme);
    }
  }
}

function cycleTheme() {
  const currentTheme = getCurrentTheme();
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];
  setTheme(nextTheme);
}

function resetCurrentTheme() {
  const currentTheme = getCurrentTheme();
  setTheme(currentTheme);
}

function initTheme() {
  // 查看document.body是否有主题类，若没有，则设置默认主题
  if (!document.body.classList.contains(...themes)) {
    resetCurrentTheme();
  }
  // console.log("initTheme");
  const style = document.createElement("style");
  style.textContent = getThemesStr();
  document.head.appendChild(style);
}

function getThemesStr() {
  let styles = "";

  for (const [theme, properties] of Object.entries(themesMap)) {
    styles += `.${theme} {\n`;
    for (const [property, value] of Object.entries(properties.css)) {
      styles += `  ${property}: ${value};\n`;
    }
    styles += `}\n\n`;
  }

  return styles;
}

function addTheme(themeIdentifier, properties) {
  // themeIdentifier为一个有格式的字符串: theme-dark/light/both-anyColorName
  // e.g.  "theme-light-blue"
  // properties 主题内容
  // e.g.
  // {
  //   "name": "Blue | 蓝",
  //   "type": "light",
  //   "css": {
  //     "--header-color": "#006fc9",
  //     "--header-text-color": "#e5e7eb",
  //     "--background-color": "#f2f2f2",
  //     "--text-color": "#323130"
  //   }
  // }
  // console.log("addTheme", theme, properties);

  themesMap[themeIdentifier] = properties;
  // store.set("app-theme", themesMap);
  // store.save();
  localforage.setItem("app-theme", themesMap);

  refreshPage();
}

function deleteTheme(themeIdentifier) {
  delete themesMap[themeIdentifier];
  // store.set("app-theme", themesMap);
  // store.save();
  localforage.setItem("app-theme", themesMap);

  if (Object.keys(themesMap).length === 0) {
    resetThemeStore();
    alert("主题配置文件为空，已经重置主题配置文件。");
  }
  refreshPage();
}

function resetThemeStore() {
  console.log("resetThemeStore", defaultThemesMap);
  // 保存到store
  // store.set("app-theme", defaultThemesMap);
  // store.save();
  localforage.setItem("app-theme", defaultThemesMap);
}

async function exportThemes() {
  try {
    if (!themesMap) {
      throw new Error("No themes found in the store");
    }

    // 将主题 Map 转换为 JSON 字符串
    const themesStr = JSON.stringify(themesMap, null, 2);
    // 复制到用户的粘贴板上
    await navigator.clipboard.writeText(themesStr);
    alert(
      "Themes have been copied to clipboard.\n主题数据已经复制到了你的剪贴板。"
    );
  } catch (error) {
    console.error("Failed to export themes:", error.message);
    alert(`导出主题失败: ${error.message}`);
  }
}

function importThemes(themesStr) {
  let themesMapCopy = { ...themesMap };
  let existThemes = [];
  let addedThemes = [];
  let errorThemes = [];

  try {
    // 尝试解析 JSON 字符串
    const themesObj = JSON.parse(themesStr);

    // 验证主题对象是否包含必要的字段
    if (!themesObj || typeof themesObj !== "object") {
      throw new Error("Invalid theme object\n无效的主题");
    }

    // 遍历每个主题，检查其结构
    for (let themeKey in themesObj) {
      const theme = themesObj[themeKey];

      // 检查主题是否包含必要的字段
      if (!theme.name || typeof theme.name !== "string") {
        throw new Error(
          `Missing or invalid name for theme: ${themeKey}\n主题缺少名称或名称无效: ${themeKey}`
        );
      }

      // 检查theme.name是否只包含英文字母与'-'，且以英文字母开头
      if (!/^[a-zA-Z][a-zA-Z-]*$/.test(themeKey)) {
        errorThemes.push("Invalid theme key: " + themeKey + ": " + theme.name);
        // errorThemes.push(themeKey);
      }

      if (
        !theme.type ||
        (theme.type !== "light" &&
          theme.type !== "dark" &&
          theme.type !== "both")
      ) {
        throw new Error(
          `Missing or invalid type for theme: ${themeKey}\n主题缺少类型或类型无效: ${themeKey}`
        );
      }

      if (!theme.css || typeof theme.css !== "object") {
        throw new Error(
          `Missing or invalid css for theme: ${themeKey}\n主题缺少CSS或CSS无效: ${themeKey}`
        );
      }

      const requiredCssFields = [
        "--header-color",
        "--background-color",
        "--text-color",
      ];
      for (const field of requiredCssFields) {
        if (!theme.css.hasOwnProperty(field)) {
          throw new Error(
            `Missing required CSS field: ${field} for theme: ${themeKey}\n主题缺少必要的CSS字段: ${field}`
          );
        }
      }

      // // 可选字段检查
      // if (theme.css['--header-text-color'] && typeof theme.css['--header-text-color'] !== 'string') {
      //   throw new Error(`Invalid header-text-color for theme: ${themeKey}\n主题的header-text-color无效: ${themeKey}`);
      // }

      // 检查主题是否已经存在
      if (themesMapCopy.hasOwnProperty(themeKey)) {
        console.log(themesMapCopy[themeKey].css, theme.css);
        if (isSameTheme(themesMapCopy[themeKey].css, theme.css)) {
          // 完全相同的主题，不需要添加
          existThemes.push(themeKey+": "+theme.name);
        } else {
          // 主题标识符已经存在但是内容不同
          // 修改后缀
          const match = themeKey.match(/-([a-z])$/);
          if (match) {
            const lastChar = match[1];
            if (lastChar === "z") {
              themeKey = themeKey + "-a";
            } else {
              themeKey =
                themeKey.slice(0, -2) +
                "-" +
                String.fromCharCode(lastChar.charCodeAt(0) + 1);
            }
          } else {
            themeKey += "-a";
          }
          themesMapCopy[themeKey] = theme;
          addedThemes.push(themeKey + ": " + theme.name);
        }
      } else {
        // 主题标识符不存在
        themesMapCopy[themeKey] = theme;
        addedThemes.push(themeKey + ": " + theme.name);
      }
    }

    // 保存主题到 store
    // store.set("app-theme", themesMapCopy);
    // store.save();
    localforage.setItem("app-theme", themesMapCopy);

    refreshPage();

    let msg = ""
    if (existThemes.length > 0) {
      msg = `以下主题已经存在:\n    ${existThemes.join(",\n    ")}\n`;
    }
    if (addedThemes.length > 0) {
      msg += `成功添加以下主题:\n    ${addedThemes.join(",\n    ")}\n`;
    }
    if (errorThemes.length > 0) {
      msg += `以下主题导入出错:\n    ${errorThemes.join(",\n    ")}\n`;
    }
    if (msg){
      alert(msg);
    } else {
      alert("什么都没发生");
    }
  } catch (error) {
    console.error("Failed to import themes:", error.message);
    alert(`导入主题失败: ${error.message}`);
  }
}

// 比较的是一层Map，一般只比较主题的css属性值
function isSameTheme(theme1, theme2) {
  // 比较键的数量
  if (Object.keys(theme1).length !== Object.keys(theme2).length) {
    return false;
  }
  // 比较键是否完全相同
  if (!Object.keys(theme1).every((key) => Object.keys(theme2).includes(key))) {
    return false;
  }

  for (const key in theme1) {
    if (theme1[key] !== theme2[key]) {
      return false;
    }
  }

  return true;
}

export {
  themes,
  getCurrentTheme,
  setTheme,
  cycleTheme,
  addTheme,
  deleteTheme,
  resetCurrentTheme,
  initTheme,
  themesMap,
  getThemesStr,
  importThemes,
  exportThemes,
};
