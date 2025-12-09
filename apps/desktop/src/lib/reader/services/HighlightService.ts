/**
 * HighlightService - 语法高亮服务
 * 为代码块提供语法高亮功能
 */

import type { ReaderSettings } from '../settings';

/**
 * 管理语法高亮
 * 如果启用了代码高亮，为文档中的代码块添加语法高亮
 */
export function manageSyntaxHighlighting(doc: Document, readerSettings: ReaderSettings): void {
    const { codeHighlighting, codeLanguage } = readerSettings;

    if (!codeHighlighting) {
        // 如果禁用，移除高亮样式和类
        const styleElement = doc.getElementById('highlight-js-theme-style');
        if (styleElement) styleElement.remove();
        doc.querySelectorAll('pre').forEach((block) => {
            if ((block as HTMLElement).dataset['highlighted']) {
                block.innerHTML = block.textContent || '';
                block.classList.remove('hljs');
                block.removeAttribute('data-highlighted');
            }
        });
        return;
    }

    // 动态导入 highlight.js（如果可用）
    // 注意：需要先安装 highlight.js: npm install highlight.js
    import('highlight.js/lib/common')
        .then((hljs) => {
            const styleId = 'highlight-js-theme-style';
            const existingStyleElement = doc.getElementById(styleId);
            if (existingStyleElement) {
                existingStyleElement.remove();
            }

            // 添加高亮样式
            const style = doc.createElement('style');
            style.id = styleId;
            style.textContent = getHighlightJsStyles();
            doc.head.appendChild(style);

            // 配置 highlight.js
            hljs.default.configure({ ignoreUnescapedHTML: true });

            // 查找所有 <pre> 元素
            const codeBlocks = doc.querySelectorAll('pre');

            codeBlocks.forEach((block) => {
                // 移除之前的高亮
                block.innerHTML = block.textContent || '';
                block.className = block.className.replace(/language-\S+/g, '');
                block.classList.remove('hljs');
                block.removeAttribute('data-highlighted');

                // 添加语言类
                if (codeLanguage && codeLanguage !== 'auto-detect') {
                    block.classList.add(`language-${codeLanguage}`);
                }

                // 应用高亮
                try {
                    hljs.default.highlightElement(block as HTMLElement);
                    (block as HTMLElement).dataset['highlighted'] = 'true';
                } catch (error) {
                    console.warn('Failed to highlight code block:', error);
                }
            });
        })
        .catch((error) => {
            // highlight.js 未安装或加载失败，跳过语法高亮
            console.warn('highlight.js not available, skipping syntax highlighting:', error);
        });
}

/**
 * 获取 highlight.js 样式（GitHub 主题）
 */
function getHighlightJsStyles(): string {
    const githubLightTheme = `
  pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}
  .hljs{color:#24292e;background:#fff}
  .hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#d73a49}
  .hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#6f42c1}
  .hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#005cc5}
  .hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#032f62}
  .hljs-built_in,.hljs-symbol{color:#e36209}
  .hljs-code,.hljs-comment,.hljs-formula{color:#6a737d}
  .hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#22863a}
  .hljs-subst{color:#24292e}
  .hljs-section{color:#005cc5;font-weight:700}
  .hljs-bullet{color:#735c0f}
  .hljs-emphasis{color:#24292e;font-style:italic}
  .hljs-strong{color:#24292e;font-weight:700}
  .hljs-addition{color:#22863a;background-color:#f0fff4}
  .hljs-deletion{color:#b31d28;background-color:#ffeef0}
  `;

    const githubDarkTheme = `
  @media (prefers-color-scheme: dark) {
    .hljs{color:#c9d1d9;background:#0d1117}
    .hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#ff7b72}
    .hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#d2a8ff}
    .hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#79c0ff}
    .hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#a5d6ff}
    .hljs-built_in,.hljs-symbol{color:#ffa657}
    .hljs-code,.hljs-comment,.hljs-formula{color:#8b949e}
    .hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#7ee787}
    .hljs-subst{color:#c9d1d9}
    .hljs-section{color:#1f6feb;font-weight:700}
    .hljs-bullet{color:#f2cc60}
    .hljs-emphasis{color:#c9d1d9;font-style:italic}
    .hljs-strong{color:#c9d1d9;font-weight:700}
    .hljs-addition{color:#aff5b4;background-color:#033a16}
    .hljs-deletion{color:#ffdcd7;background-color:#67060c}
  }
  `;

    return `${githubLightTheme}\n${githubDarkTheme}`;
}
