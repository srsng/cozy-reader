const themes = ['theme-light', 'theme-gray', 'theme-dark'];

// 主题Map
// 内部值不带分号;
const themesMap = {
  ".theme-light": {
    "--header-color": "#006fc9",
    "--background-color": "#f2f2f2",
    "--text-color": "#323130",
  },

  ".theme-gray": {
    "--header-color": "#374151",
    "--background-color": "#4b5563",
    "--text-color": "#e5e7eb",
  },

  ".theme-dark": {
    "--header-color": "#333333",
    "--background-color": "#282828",
    "--text-color": "#e5e7eb",
  },
}

function getCurrentTheme() {
  const savedTheme = localStorage.getItem('currTheme');
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
    localStorage.setItem('currTheme', theme);

    const iframe = document.querySelector('#viewer iframe')
    if (iframe) {
      // console.log('iframe yes', iframe);
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
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
}

function getThemesStr() {
  let styles = '';

  for (const [theme, properties] of Object.entries(themesMap)) {
    styles += `${theme} {\n`;
    for (const [property, value] of Object.entries(properties)) {
      styles += `  ${property}: ${value};\n`;
    }
    styles += `}\n\n`;
  }

  return styles;
}

export {  
  themes, getCurrentTheme, setTheme, cycleTheme, resetCurrentTheme, initTheme, 
  themesMap, getThemesStr 
};