import type { ReaderSettings } from '../settings';
import { injectThemeVariables } from '../style';

/**
 * 转换上下文
 */
export interface TransformContext {
    bookKey: string;
    readerSettings: ReaderSettings;
    content: string;
    transformers: ('punctuation' | 'footnote' | 'language')[];
    reversePunctuationTransform?: boolean;
}

/**
 * 标点符号映射表（用于垂直排版）
 */
const punctuationMap: Record<string, string> = {
    '\u201C': '\uFE43', // " -> ﹃
    '\u201D': '\uFE44', // " -> ﹄
    '\u2018': '\uFE41', // ' -> ﹁
    '\u2019': '\uFE42' // ' -> ﹂
};

/**
 * 检测语言代码是否有效
 */
function isValidLang(lang: string | undefined): boolean {
    if (!lang) return false;
    // 简单的语言代码验证：2-5个字母，可能包含连字符
    return /^[a-z]{2}(-[a-z]{2,3})?$/i.test(lang);
}

/**
 * 简单的语言检测（基于常见字符范围）
 */
function detectLanguage(text: string): string {
    // 移除 HTML 标签
    const cleanText = text.replace(/<[^>]+>/g, ' ').trim();
    if (!cleanText) return 'en';

    // 检测中文字符
    if (/[\u4e00-\u9fff]/.test(cleanText)) {
        return 'zh';
    }
    // 检测日文字符
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(cleanText)) {
        return 'ja';
    }
    // 检测韩文字符
    if (/[\uac00-\ud7af]/.test(cleanText)) {
        return 'ko';
    }
    // 检测阿拉伯文字符
    if (/[\u0600-\u06ff]/.test(cleanText)) {
        return 'ar';
    }
    // 检测俄文字符
    if (/[\u0400-\u04ff]/.test(cleanText)) {
        return 'ru';
    }

    // 默认返回英语
    return 'en';
}

/**
 * 转换内容（导出函数，便于直接调用）
 */
export async function transformContent(ctx: TransformContext): Promise<string> {
    const service = new TransformService();
    return service.transformContent(ctx);
}

/**
 * TransformService - 内容转换服务
 * 在渲染前转换 HTML/CSS 内容
 */
export class TransformService {
    /**
     * 转换内容
     * 根据 transformers 列表应用相应的转换器
     */
    async transformContent(ctx: TransformContext): Promise<string> {
        let transformed = ctx.content;

        // 应用转换器
        for (const transformerName of ctx.transformers) {
            try {
                switch (transformerName) {
                    case 'punctuation':
                        transformed = this.transformPunctuation(transformed, ctx);
                        break;
                    case 'footnote':
                        transformed = this.transformFootnote(transformed);
                        break;
                    case 'language':
                        transformed = this.transformLanguage(transformed);
                        break;
                }
            } catch (error) {
                console.warn(`Error in transformer ${transformerName}:`, error);
            }
        }

        return transformed;
    }

    /**
     * 标点符号转换（垂直排版时使用）
     */
    private transformPunctuation(content: string, ctx: TransformContext): string {
        const shouldTransform = ctx.readerSettings.vertical === true;
        if (!shouldTransform) return content;

        let result = content;
        for (const [original, vertical] of Object.entries(punctuationMap)) {
            if (ctx.reversePunctuationTransform) {
                result = result.replace(new RegExp(vertical, 'g'), original);
            } else {
                result = result.replace(new RegExp(original, 'g'), vertical);
            }
        }

        return result;
    }

    /**
     * 脚注处理
     */
    private transformFootnote(content: string): string {
        // 标准化 EPUB 脚注标签
        return content.replace(
            /<aside\s+epub:type\s*=\s*["'](footnote|endnote|note|rearnote)["']([^>]*)>/gi,
            '<aside class="epubtype-footnote" epub:type="$1"$2>'
        );
    }

    /**
     * 语言标记处理
     */
    private transformLanguage(content: string): string {
        const attrsMatch = content.match(/<html\b([^>]*)>/i);
        if (!attrsMatch) return content;

        let attrs = attrsMatch[1] || '';
        const langRegex = / lang="([^"]*)"/i;
        const xmlLangRegex = / xml:lang="([^"]*)"/i;
        const xmlLangMatch = attrs.match(xmlLangRegex);
        const langMatch = attrs.match(langRegex);

        const existingLang = langMatch?.[1] || xmlLangMatch?.[1];
        if (!isValidLang(existingLang)) {
            // 提取文本内容进行语言检测
            const mainContent = content.replace(/<[^>]+>/g, ' ');
            const lang = detectLanguage(mainContent);
            const newLangAttr = ` lang="${lang}"`;
            const newXmlLangAttr = ` xml:lang="${lang}"`;

            attrs = langMatch ? attrs.replace(langRegex, newLangAttr) : attrs + newLangAttr;
            attrs = xmlLangMatch
                ? attrs.replace(xmlLangRegex, newXmlLangAttr)
                : attrs + newXmlLangAttr;
            return content.replace(attrsMatch[0], `<html${attrs}>`);
        }

        return content;
    }
}

/**
 * 转换样式表
 * 标准化书籍 CSS：字体大小、视口单位、硬编码颜色等
 */
export function transformStylesheet(vw: number, vh: number, css: string): string {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const fontScale = isMobile ? 1.25 : 1;

    // 修复居中 + 零缩进的问题
    const ruleRegex = /([^{]+)({[^}]+})/g;
    css = css.replace(ruleRegex, (match, selector, block) => {
        const hasTextAlignCenter = /text-align\s*:\s*center\s*[;$]/.test(block);
        const hasTextIndentZero = /text-indent\s*:\s*0(?:\.0+)?(?:px|em|rem|%)?\s*[;$]/.test(block);

        if (hasTextAlignCenter && hasTextIndentZero) {
            block = block.replace(/(text-align\s*:\s*center)(\s*;|\s*$)/g, '$1 !important$2');
            block = block.replace(
                /(text-indent\s*:\s*0(?:\.0+)?(?:px|em|rem|%)?)(\s*;|\s*$)/g,
                '$1 !important$2'
            );
            return selector + block;
        }
        return match;
    });

    // 替换绝对字体大小为 rem 单位
    css = css
        .replace(/font-size\s*:\s*xx-small/gi, 'font-size: 0.6rem')
        .replace(/font-size\s*:\s*x-small/gi, 'font-size: 0.75rem')
        .replace(/font-size\s*:\s*small/gi, 'font-size: 0.875rem')
        .replace(/font-size\s*:\s*medium/gi, 'font-size: 1rem')
        .replace(/font-size\s*:\s*large/gi, 'font-size: 1.2rem')
        .replace(/font-size\s*:\s*x-large/gi, 'font-size: 1.5rem')
        .replace(/font-size\s*:\s*xx-large/gi, 'font-size: 2rem')
        .replace(/font-size\s*:\s*xxx-large/gi, 'font-size: 3rem')
        .replace(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi, (_, px) => {
            const rem = parseFloat(px) / fontScale / 16;
            return `font-size: ${rem}rem`;
        })
        .replace(/font-size\s*:\s*(\d+(?:\.\d+)?)pt/gi, (_, pt) => {
            const rem = parseFloat(pt) / fontScale / 12;
            return `font-size: ${rem}rem`;
        });

    // 替换视口单位（vw/vh 会导致布局问题）
    css = css
        .replace(/(\d*\.?\d+)vw/gi, (_, d) => (parseFloat(d) * vw) / 100 + 'px')
        .replace(/(\d*\.?\d+)vh/gi, (_, d) => (parseFloat(d) * vh) / 100 + 'px');

    // 替换硬编码颜色为 CSS 变量
    css = css
        .replace(/([\s;])font-family\s*:\s*monospace/gi, '$1font-family: var(--monospace)')
        .replace(/([\s;])color\s*:\s*black/gi, '$1color: var(--theme-fg-color)')
        .replace(/([\s;])color\s*:\s*#000000/gi, '$1color: var(--theme-fg-color)')
        .replace(/([\s;])color\s*:\s*#000/gi, '$1color: var(--theme-fg-color)')
        .replace(/([\s;])color\s*:\s*rgb\(0,\s*0,\s*0\)/gi, '$1color: var(--theme-fg-color)');

    return css;
}

/**
 * 应用图片样式
 */
export function applyImageStyle(doc: Document): void {
    doc.querySelectorAll('img').forEach((img) => {
        const parent = img.parentNode;
        if (!parent || parent.nodeType !== Node.ELEMENT_NODE) return;
        const hasTextSiblings = Array.from(parent.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        );
        if (hasTextSiblings) {
            img.classList.add('has-text-siblings');
        }
    });
}

/**
 * 应用固定布局样式（PDF/CBZ）
 */
export function applyFixedlayoutStyles(doc: Document, readerSettings: ReaderSettings): void {
    const overrideColor = readerSettings.overrideColor ?? false;
    const invertImgColorInDark = readerSettings.invertImgColorInDark ?? false;

    const existingStyleId = 'fixed-layout-styles';
    let style = doc.getElementById(existingStyleId) as HTMLStyleElement;
    if (style) {
        style.remove();
    }
    style = doc.createElement('style');
    style.id = existingStyleId;

    // 注入完整的主题变量
    const themeVars = injectThemeVariables();

    style.textContent = `
    ${themeVars}
    html {
      color-scheme: light dark;
    }
    body {
      position: relative;
      background-color: transparent !important;
      color: var(--color-foreground) !important;
    }
    #canvas {
      display: inline-block;
      width: fit-content;
      height: fit-content;
      background-color: transparent !important;
    }
    img, canvas {
      ${overrideColor ? 'mix-blend-mode: multiply;' : ''}
    }
    /* 暗色模式下的图片处理 - 通过 color-scheme 检测 */
    @media (prefers-color-scheme: dark) {
      img, canvas {
        ${invertImgColorInDark ? 'filter: invert(100%);' : ''}
        ${overrideColor ? 'mix-blend-mode: screen;' : ''}
      }
    }
    img.singlePage {
      position: relative;
    }
  `;
    doc.head.appendChild(style);
}
