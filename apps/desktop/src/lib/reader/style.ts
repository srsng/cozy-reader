/**
 * 样式生成系统
 * 生成阅读器所需的 CSS 样式
 */

import type { ReaderSettings } from './settings';
import {
  SERIF_FONTS,
  SANS_SERIF_FONTS,
  MONOSPACE_FONTS,
  CJK_SERIF_FONTS,
  CJK_SANS_SERIF_FONTS,
  FALLBACK_FONTS,
} from './constants';
import { transformStylesheet, applyImageStyle, applyFixedlayoutStyles } from './services/TransformService';

/**
 * 获取字体样式
 */
function getFontStyles(
  serif: string,
  sansSerif: string,
  monospace: string,
  defaultFont: string,
  defaultCJKFont: string,
  fontSize: number,
  minFontSize: number,
  fontWeight: number,
  overrideFont: boolean,
): string {
  const lastSerifFonts = ['Georgia', 'Times New Roman'];
  const serifFonts = [
    serif,
    ...SERIF_FONTS.filter(
      (font) => font !== serif && font !== defaultCJKFont && !lastSerifFonts.includes(font),
    ),
    ...(defaultCJKFont !== serif ? [defaultCJKFont] : []),
    ...CJK_SERIF_FONTS.filter((font) => font !== serif && font !== defaultCJKFont),
    ...lastSerifFonts.filter(
      (font) => SERIF_FONTS.includes(font) && !lastSerifFonts.includes(defaultCJKFont),
    ),
    ...FALLBACK_FONTS,
  ];
  const sansSerifFonts = [
    sansSerif,
    ...SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
    ...(defaultCJKFont !== sansSerif ? [defaultCJKFont] : []),
    ...CJK_SANS_SERIF_FONTS.filter((font) => font !== sansSerif && font !== defaultCJKFont),
    ...FALLBACK_FONTS,
  ];
  const monospaceFonts = [monospace, ...MONOSPACE_FONTS.filter((font) => font !== monospace)];

  const fontStyles = `
    html {
      --serif: ${serifFonts.map((font) => `"${font}"`).join(', ')}, serif;
      --sans-serif: ${sansSerifFonts.map((font) => `"${font}"`).join(', ')}, sans-serif;
      --monospace: ${monospaceFonts.map((font) => `"${font}"`).join(', ')}, monospace;
    }
    html, body {
      font-family: var(${defaultFont.toLowerCase() === 'serif' ? '--serif' : '--sans-serif'}) ${overrideFont ? '!important' : ''};
      font-size: ${fontSize}px !important;
      font-weight: ${fontWeight};
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    }
    font[size="1"] {
      font-size: ${minFontSize}px;
    }
    font[size="2"] {
      font-size: ${minFontSize * 1.5}px;
    }
    font[size="3"] {
      font-size: ${fontSize}px;
    }
    font[size="4"] {
      font-size: ${fontSize * 1.2}px;
    }
    font[size="5"] {
      font-size: ${fontSize * 1.5}px;
    }
    font[size="6"] {
      font-size: ${fontSize * 2}px;
    }
    font[size="7"] {
      font-size: ${fontSize * 3}px;
    }
    /* hardcoded inline font size */
    [style*="font-size: 16px"], [style*="font-size:16px"] {
      font-size: 1rem !important;
    }
    pre, code, kbd {
      font-family: var(--monospace);
    }
    body *:not(pre):not(code):not(kbd):not(pre *):not(code *):not(kbd *) {
      ${overrideFont ? 'font-family: revert !important;' : ''}
    }
  `;
  return fontStyles;
}

/**
 * 注入主题 CSS 变量到文档
 * 从主窗口获取所有主题相关的 CSS 变量并注入到文档中
 */
function injectThemeVariables(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  // 定义需要注入的主题变量列表（使用 app.css 中实际使用的 --color-* 系列变量）
  const themeVariables = [
    // 颜色变量（app.css 中实际使用的）
    '--color-foreground',
    '--color-background',
    '--color-card',
    '--color-card-foreground',
    '--color-primary',
    '--color-primary-foreground',
    '--color-secondary',
    '--color-secondary-foreground',
    '--color-muted',
    '--color-muted-foreground',
    '--color-accent',
    '--color-accent-foreground',
    '--color-destructive',
    '--color-border',
    '--color-input',
    '--color-ring',
    '--color-popover',
    '--color-popover-foreground',
    '--color-sidebar',
    '--color-sidebar-foreground',
    '--color-sidebar-primary',
    '--color-sidebar-primary-foreground',
    '--color-sidebar-accent',
    '--color-sidebar-accent-foreground',
    '--color-sidebar-border',
    '--color-sidebar-ring',
    '--color-body-background',
    // 图表颜色
    '--color-chart-1',
    '--color-chart-2',
    '--color-chart-3',
    '--color-chart-4',
    '--color-chart-5',
    // 圆角变量
    '--radius-sm',
    '--radius-md',
    '--radius-lg',
    '--radius-xl',
    '--radius',
    // 不透明度变量
    '--ui-opacity',
    '--body-opacity',
  ];

  // 从主窗口获取 CSS 变量值（如果在 iframe 中）
  let root: HTMLElement;
  try {
    // 优先尝试从主窗口获取
    if (window.parent && window.parent !== window) {
      root = window.parent.document.documentElement;
    } else if (window.top && window.top !== window) {
      root = window.top.document.documentElement;
    } else {
      // 不在 iframe 中，使用当前窗口
      root = document.documentElement;
    }
  } catch (e) {
    // 跨域限制，使用当前窗口
    root = document.documentElement;
  }

  const computedStyle = getComputedStyle(root);
  const variableDefinitions: string[] = [];

  // 从主窗口获取所有变量值
  themeVariables.forEach((varName) => {
    const value = computedStyle.getPropertyValue(varName)?.trim();
    if (value) {
      variableDefinitions.push(`      ${varName}: ${value};`);
    }
  });

  if (variableDefinitions.length === 0) {
    // 没有找到任何主题变量，返回空字符串
    return '';
  }

  return `
    html {
${variableDefinitions.join('\n')}
    }
  `;
}

/**
 * 获取颜色样式
 */
function getColorStyles(
  overrideColor: boolean,
  invertImgColorInDark: boolean,
): string {
  // 注入完整的主题变量
  const themeVars = injectThemeVariables();

  const colorStyles = `
    ${themeVars}
    html {
      color-scheme: light dark;
    }
    html, body {
      color: var(--color-foreground) !important;
    }
    html {
      background-color: transparent !important;
    }
    body {
      background-color: transparent !important;
    }
    /* 强制设置所有文本元素的颜色 */
    p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, dd, dt, pre, code {
      color: var(--color-foreground) !important;
    }
    section, div, p, font, h1, h2, h3, h4, h5, h6 {
      ${overrideColor ? `background-color: var(--color-background) !important;` : ''}
      ${overrideColor ? `color: var(--color-foreground) !important;` : ''}
    }
    pre, span {
      ${overrideColor ? `background-color: var(--color-background) !important;` : ''}
    }
    a:any-link {
      color: var(--color-muted-foreground) !important;
      text-decoration: none;
    }
    a:hover {
      cursor: pointer;
    }
    body.pbg {
      background-color: transparent !important;
    }
    img {
      ${overrideColor ? 'mix-blend-mode: multiply;' : ''}
    }
    /* 暗色模式下的图片处理 - 通过 color-scheme 检测 */
    @media (prefers-color-scheme: dark) {
      img {
        ${invertImgColorInDark ? 'filter: invert(100%);' : ''}
      }
      p img, span img, sup img {
        mix-blend-mode: screen;
      }
    }
    hr {
      mix-blend-mode: multiply;
    }
    p img, span img, sup img {
      mix-blend-mode: multiply;
    }
    /* override inline hardcoded text color */
    font[color="#000000"], font[color="#000"], font[color="black"],
    font[color="rgb(0,0,0)"], font[color="rgb(0, 0, 0)"],
    *[style*="color: rgb(0,0,0)"], *[style*="color: rgb(0, 0, 0)"],
    *[style*="color: #000"], *[style*="color: #000000"], *[style*="color: black"],
    *[style*="color:rgb(0,0,0)"], *[style*="color:rgb(0, 0, 0)"],
    *[style*="color:#000"], *[style*="color:#000000"], *[style*="color:black"] {
      color: var(--color-foreground) !important;
    }
    #pg-header * {
      color: inherit !important;
    }
    .x-ebookmaker, .x-ebookmaker-cover, .x-ebookmaker-coverpage {
      background-color: unset !important;
    }
    .chapterHeader, .chapterHeader * {
      border-color: unset;
      ${overrideColor ? 'background-color: var(--color-background) !important;' : ''}
    }
    /* 参考 BookReader.vue 和 typography 组件的 blockquote 样式 */
    blockquote {
      border-left: 4px solid var(--color-primary);
      background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
      border-radius: 0 0.5rem 0.5rem 0;
      margin: 1.5em 0;
      padding: 0.5rem 1rem;
      quotes: "\\201C""\\201D""\\2018""\\2019";
    }
    blockquote:before {
      color: var(--color-primary);
      filter: brightness(2);
      content: open-quote;
      font-size: 4em;
      line-height: 0.1em;
      margin-right: 0.25em;
      vertical-align: -0.4em;
    }
    blockquote br {
      content: "";
      display: block;
      line-height: 0.5em;
    }
    blockquote * {
      display: inline;
      white-space: normal;
    }
    table *[bgcolor] {
      background-color: var(--color-background) !important;
      filter: brightness(0.8);
    }
    [bgcolor] {
      background: transparent !important;
    }
    /* 参考 typography 组件和 BookReader.vue 的标题样式 */
    h1 {
      margin-top: 0;
      margin-bottom: 0.5em;
      font-size: 2.25em;
      line-height: 120%;
      font-weight: 800;
      text-align: center;
      letter-spacing: -0.025em;
    }
    h2 {
      margin-top: 2.5rem;
      margin-bottom: 0.5em;
      font-size: 1.5em;
      line-height: 120%;
      font-weight: 600;
      text-align: center;
      letter-spacing: -0.025em;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 0.5rem;
    }
    h2:first-child {
      margin-top: 0;
    }
    h3 {
      margin-top: 2rem;
      margin-bottom: 0.5em;
      font-size: 1.25em;
      line-height: 120%;
      font-weight: 600;
      letter-spacing: -0.025em;
    }
    h4 {
      margin-top: 2rem;
      margin-bottom: 0.5em;
      font-size: 1.2em;
      line-height: 120%;
      font-weight: 600;
      letter-spacing: -0.025em;
    }
    h5 {
      margin-top: 2rem;
      margin-bottom: 0.5em;
      font-size: 1.125em;
      line-height: 120%;
      font-weight: 600;
      letter-spacing: -0.025em;
    }
    h6 {
      margin-top: 2rem;
      margin-bottom: 0.5em;
      font-size: 1em;
      line-height: 120%;
      font-weight: 600;
      letter-spacing: -0.025em;
    }
    /* 参考 BookReader.vue 和 typography 组件的段落样式 */
    p {
      margin-bottom: 1em;
    }
    /* 参考 BookReader.vue 和 typography 组件的列表样式 */
    ul, ol {
      margin-top: 1em;
      margin-bottom: 1em;
      padding-left: 1.5rem;
    }
    li {
      margin-bottom: 0.25em;
    }
    li p {
      margin: 0;
    }
    /* 参考 typography 组件的表格样式 */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    table th,
    table td {
      border: 1px solid var(--color-border);
      padding: 0.5rem 1rem;
      text-align: left;
    }
    table th {
      font-weight: 600;
    }
    table tbody tr:nth-child(even) {
      background-color: var(--color-muted);
    }
    /* 参考 typography 组件的代码块样式 */
    code {
      background-color: var(--color-muted);
      padding: 0.125rem 0.25rem;
      border-radius: calc(var(--radius) - 2px);
      font-size: 0.875em;
    }
    pre {
      background-color: var(--color-muted);
      padding: 1rem;
      border-radius: calc(var(--radius) - 2px);
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }
    ol *, li *, code, pre, tt {
      white-space: pre-wrap !important;
    }
  `;
  return colorStyles;
}

/**
 * 获取布局样式
 */
function getLayoutStyles(
  overrideLayout: boolean,
  paragraphMargin: number,
  lineSpacing: number,
  wordSpacing: number,
  letterSpacing: number,
  textIndent: number,
  justify: boolean,
  hyphenate: boolean,
  zoomLevel: number,
  writingMode: string,
  vertical: boolean,
): string {
  const layoutStyle = `
  @namespace epub "http://www.idpf.org/2007/ops";
  html {
    --default-text-align: ${justify ? 'justify' : 'start'};
    hanging-punctuation: allow-end last;
    orphans: 2;
    widows: 2;
  }
  [align="left"] { text-align: left; }
  [align="right"] { text-align: right; }
  [align="center"] { text-align: center; }
  [align="justify"] { text-align: justify; }
  :is(hgroup, header) p {
      text-align: unset;
      hyphens: unset;
  }
  pre {
      white-space: pre-wrap !important;
      tab-size: 2;
  }
  html, body {
    ${writingMode === 'auto' ? '' : `writing-mode: ${writingMode} !important;`}
    text-align: var(--default-text-align);
    max-height: unset;
  }
  body {
    overflow: unset;
    zoom: ${zoomLevel};
  }
  svg, img {
    height: auto;
    width: auto;
    background-color: transparent !important;
  }
  a {
    position: relative !important;
  }
  a::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
  }
  p, blockquote, dd, div:not(:has(*:not(b, a, em, i, strong, u, span))) {
    line-height: ${lineSpacing} ${overrideLayout ? '!important' : ''};
    word-spacing: ${wordSpacing}px ${overrideLayout ? '!important' : ''};
    letter-spacing: ${letterSpacing}px ${overrideLayout ? '!important' : ''};
    text-indent: ${vertical ? textIndent * 1.2 : textIndent}em ${overrideLayout ? '!important' : ''};
    ${justify ? `text-align: justify ${overrideLayout ? '!important' : ''};` : ''}
    ${!justify && overrideLayout ? 'text-align: initial !important;' : ''};
    -webkit-hyphens: ${hyphenate ? 'auto' : 'manual'};
    hyphens: ${hyphenate ? 'auto' : 'manual'};
    -webkit-hyphenate-limit-before: 3;
    -webkit-hyphenate-limit-after: 2;
    -webkit-hyphenate-limit-lines: 2;
    hanging-punctuation: allow-end last;
    widows: 2;
  }
  p:has(> img:only-child), p:has(> span:only-child > img:only-child),
  p:has(> img:not(.has-text-siblings)),
  p:has(> a:first-child + img:last-child) {
    text-indent: initial !important;
  }
  blockquote[align="center"], div[align="center"],
  p[align="center"], dd[align="center"],
  li p, ol p, ul p {
    text-indent: initial !important;
  }
  p {
    ${vertical ? `margin-left: ${paragraphMargin}em ${overrideLayout ? '!important' : ''};` : ''}
    ${vertical ? `margin-right: ${paragraphMargin}em ${overrideLayout ? '!important' : ''};` : ''}
    ${!vertical ? `margin-top: ${paragraphMargin}em ${overrideLayout ? '!important' : ''};` : ''}
    ${!vertical ? `margin-bottom: ${paragraphMargin}em ${overrideLayout ? '!important' : ''};` : ''}
  }
  div {
    ${vertical && overrideLayout ? `margin-left: ${paragraphMargin}em !important;` : ''}
    ${vertical && overrideLayout ? `margin-right: ${paragraphMargin}em !important;` : ''}
    ${!vertical && overrideLayout ? `margin-top: ${paragraphMargin}em !important;` : ''}
    ${!vertical && overrideLayout ? `margin-bottom: ${paragraphMargin}em !important;` : ''}
  }
  h1, h2, h3, h4, h5, h6 {
    text-align: initial;
  }
  :lang(zh), :lang(ja), :lang(ko) {
    widows: 1;
    orphans: 1;
  }
  pre {
    white-space: pre-wrap !important;
  }
  .epubtype-footnote,
  aside[epub|type~="endnote"],
  aside[epub|type~="footnote"],
  aside[epub|type~="note"],
  aside[epub|type~="rearnote"] {
    display: none;
  }
  img.pi {
    ${vertical ? 'transform: rotate(90deg);' : ''}
    ${vertical ? 'transform-origin: center;' : ''}
    ${vertical ? 'height: 2em;' : ''}
    ${vertical ? `width: ${lineSpacing}em;` : ''}
    ${vertical ? `vertical-align: unset;` : ''}
  }
  .duokan-footnote-content,
  .duokan-footnote-item {
    display: none;
  }
  .calibre {
    color: unset;
  }
  sup img {
    height: 1em;
  }
  img.has-text-siblings {
    height: 1em;
    vertical-align: baseline;
  }
  .ie6 img {
    width: auto;
    height: auto;
  }
  .duokan-footnote img:not([class]) {
    width: 0.8em;
    height: 0.8em;
  }
  div.left *, p.left * { text-align: left; }
  div.right *, p.right * { text-align: right; }
  div.center *, p.center * { text-align: center; }
  div.justify *, p.justify * { text-align: justify; }
  .nonindent, .noindent {
    text-indent: unset !important;
  }
`;
  return layoutStyle;
}

/**
 * 获取翻译样式
 */
function getTranslationStyles(showSource: boolean): string {
  return `
  .translation-source {
  }
  .translation-target {
  }
  .translation-target.hidden {
    display: none !important;
  }
  .translation-target-block {
    display: block !important;
    ${showSource ? 'margin: 0.5em 0 !important;' : ''}
  }
  .translation-target-toc {
    display: block !important;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
}

/**
 * 获取完整样式
 * 聚合所有样式生成函数
 * 直接使用全局 CSS 变量，不依赖主题代码
 */
export function getStyles(readerSettings: ReaderSettings): string {

  const layoutStyles = getLayoutStyles(
    readerSettings.overrideLayout ?? false,
    readerSettings.paragraphMargin ?? 1,
    readerSettings.lineHeight ?? 1.6,
    readerSettings.wordSpacing ?? 0,
    readerSettings.letterSpacing ?? 0,
    readerSettings.textIndent ?? 0,
    readerSettings.fullJustification ?? true,
    readerSettings.hyphenation ?? true,
    (readerSettings.zoomLevel ?? 100) / 100.0,
    readerSettings.writingMode ?? 'auto',
    readerSettings.vertical ?? false,
  );

  // 移动端字体缩放
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const fontScale = isMobile ? 1.25 : 1;

  const fontStyles = getFontStyles(
    readerSettings.serifFont ?? 'Georgia',
    readerSettings.sansSerifFont ?? 'Arial',
    readerSettings.monospaceFont ?? 'Consolas',
    readerSettings.defaultFont ?? 'Serif',
    readerSettings.defaultCJKFont ?? 'SimSun',
    (readerSettings.defaultFontSize ?? 16) * fontScale,
    readerSettings.minimumFontSize ?? 8,
    readerSettings.fontWeight ?? 400,
    readerSettings.overrideFont ?? false,
  );

  const colorStyles = getColorStyles(
    readerSettings.overrideColor ?? false,
    readerSettings.invertImgColorInDark ?? false,
  );

  const translationStyles = getTranslationStyles(readerSettings.showTranslateSource ?? true);
  const userStylesheet = readerSettings.userStylesheet ?? '';

  return `${layoutStyles}\n${fontStyles}\n${colorStyles}\n${translationStyles}\n${userStylesheet}`;
}

/**
 * 应用翻译样式
 */
export function applyTranslationStyle(readerSettings: ReaderSettings): void {
  const styleId = 'translation-style';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = getTranslationStyles(readerSettings.showTranslateSource ?? true);
  document.head.appendChild(styleElement);
}

/**
 * 应用滚动模式类
 */
export function applyScrollModeClass(document: Document, isScrollMode: boolean): void {
  document.body.classList.remove('scroll-mode', 'paginated-mode');
  document.body.classList.add(isScrollMode ? 'scroll-mode' : 'paginated-mode');
}

// 导出 TransformService 的函数
export { transformStylesheet, applyImageStyle, applyFixedlayoutStyles };

// 导出主题变量注入函数，供其他模块使用
export { injectThemeVariables };
