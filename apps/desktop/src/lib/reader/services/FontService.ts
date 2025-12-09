/**
 * FontService - 字体管理服务
 * 挂载系统字体和自定义字体
 */

/**
 * 检测是否为 CJK 语言环境
 */
function isCJKEnv(): boolean {
    if (typeof navigator === 'undefined') return false;
    const lang = navigator.language.toLowerCase();
    return (
        lang.startsWith('zh') ||
        lang.startsWith('ja') ||
        lang.startsWith('ko') ||
        lang.includes('cjk')
    );
}

/**
 * 检测文本是否为 CJK 语言
 */
export function isCJKLang(lang: string | string[] | undefined): boolean {
    if (!lang) return false;
    const langStr = Array.isArray(lang) ? lang[0] : lang;
    const langLower = langStr.toLowerCase();
    return (
        langLower.startsWith('zh') ||
        langLower.startsWith('ja') ||
        langLower.startsWith('ko') ||
        langLower.includes('cjk')
    );
}

/**
 * 基础 Google 字体列表
 */
const basicGoogleFonts = [
    { family: 'Bitter', weights: 'ital,wght@0,100..900;1,100..900' },
    { family: 'Fira Code', weights: 'wght@300..700' },
    { family: 'Literata', weights: 'ital,opsz,wght@0,7..72,200..900;1,7..72,200..900' },
    { family: 'Merriweather', weights: 'ital,opsz,wght@0,18..144,300..900;1,18..144,300..900' },
    { family: 'Noto Sans', weights: 'ital,wght@0,100..900;1,100..900' },
    { family: 'Open Sans', weights: 'ital,wght@0,300..800;1,300..800' },
    { family: 'Roboto', weights: 'ital,wght@0,100..900;1,100..900' },
    { family: 'Vollkorn', weights: 'ital,wght@0,400..900;1,400..900' },
];

/**
 * CJK Google 字体列表
 */
const cjkGoogleFonts = [
    { family: 'LXGW WenKai TC', weights: '' },
    { family: 'Noto Sans SC', weights: '' },
    { family: 'Noto Sans TC', weights: '' },
    { family: 'Noto Serif JP', weights: '' },
];

/**
 * 获取基础字体链接
 */
function getAdditionalBasicFontLinks(): string {
    return `
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${basicGoogleFonts
            .map(
                ({ family, weights }) =>
                    `family=${encodeURIComponent(family)}${weights ? `:${weights}` : ''}`,
            )
            .join('&')}&display=swap" crossorigin="anonymous">
`;
}

/**
 * 获取 CJK 字体链接
 */
function getAdditionalCJKFontLinks(): string {
    return `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/misans-webfont@1.0.4/misans-l3/misans-l3/result.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6/font.min.css" crossorigin="anonymous" />
  <link rel='stylesheet' href='https://chinese-fonts-cdn.netlify.app/packages/hwmct/dist/%E6%B1%87%E6%96%87%E6%98%8E%E6%9C%9D%E4%BD%93/result.css' crossorigin="anonymous" />
  <link rel='stylesheet' href='https://chinese-fonts-cdn.netlify.app/packages/jhlst/dist/%E4%BA%AC%E8%8F%AF%E8%80%81%E5%AE%8B%E4%BD%93v2_002/result.css' crossorigin="anonymous" />
  <link rel='stylesheet' href='https://chinese-fonts-cdn.netlify.app/packages/syst/dist/SourceHanSerifCN/result.css' crossorigin="anonymous" />
  <link rel='stylesheet' href='https://chinese-fonts-cdn.netlify.app/packages/GuanKiapTsingKhai/dist/GuanKiapTsingKhai-T/result.css' crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${cjkGoogleFonts
            .map(
                ({ family, weights }) =>
                    `family=${encodeURIComponent(family)}${weights ? `:${weights}` : ''}`,
            )
            .join('&')}&display=swap" crossorigin="anonymous" />
`;
}

/**
 * 获取 CJK 字体 @font-face 定义
 */
function getAdditionalCJKFontFaces(): string {
    return `
  @font-face {
    font-family: "FangSong";
    font-display: swap;
    src: local("Fang Song"), local("FangSong"), local("Noto Serif CJK"), local("Source Han Serif SC VF"), url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.eot");
    src: url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.eot?#iefix") format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.woff2") format("woff2"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.woff") format("woff"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.ttf") format("truetype"),
    url("https://db.onlinewebfonts.com/t/2ecbfe1d9bfc191c6f15c0ccc23cbd43.svg#FangSong") format("svg");
  }
  @font-face {
    font-family: "Kaiti";
    font-display: swap;
    src: local("Kai"), local("KaiTi"), local("AR PL UKai"), local("LXGW WenKai GB Screen"), url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.eot");
    src: url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.eot?#iefix")format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.woff2")format("woff2"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.woff")format("woff"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/1ee9941f1b8c128110ca4307dda59917.svg#STKaiti")format("svg");
  }
  @font-face {
    font-family: "Heiti";
    font-display: swap;
    src: local("Hei"), local("SimHei"), local("WenQuanYi Zen Hei"), local("Source Han Sans SC VF"), url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.eot");
    src: url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.eot?#iefix")format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.woff2")format("woff2"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.woff")format("woff"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/a4948b9d43a91468825a5251df1ec58d.svg#WenQuanYi Micro Hei")format("svg");
  }
  @font-face {
    font-family: "XiHeiti";
    font-display: swap;
    src: local("PingFang SC"), local("Microsoft YaHei"), local("WenQuanYi Micro Hei"), local("FZHei-B01"), url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.eot");
    src: url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.eot?#iefix")format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.woff2")format("woff2"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.woff")format("woff"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/4f0b783ba4a1b381fc7e7af81ecab481.svg#STHeiti J Light")format("svg");
  }
  `;
}

/**
 * 自定义字体接口
 */
export interface CustomFont {
    id: string;
    name: string;
    family?: string;
    style?: string;
    weight?: number;
    path: string;
    blobUrl?: string;
}

/**
 * 挂载额外字体（系统字体和 CJK 字体）
 */
export function mountAdditionalFonts(doc: Document, isCJK: boolean = false): void {
    const mountCJKFonts = isCJK || isCJKEnv();
    let links = getAdditionalBasicFontLinks();

    if (mountCJKFonts) {
        // 添加 CJK 字体 @font-face
        const style = doc.createElement('style');
        style.textContent = getAdditionalCJKFontFaces();
        doc.head.appendChild(style);

        links = `${links}\n${getAdditionalCJKFontLinks()}`;
    }

    // 解析并添加字体链接
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(links, 'text/html');

    Array.from(parsedDocument.head.children).forEach((child) => {
        if (child.tagName === 'LINK') {
            const link = doc.createElement('link');
            link.rel = child.getAttribute('rel') || '';
            link.href = child.getAttribute('href') || '';
            link.crossOrigin = child.getAttribute('crossorigin') || 'anonymous';

            // 检查是否已存在相同的链接
            const existingLink = Array.from(doc.head.querySelectorAll('link')).find(
                (l) => l.href === link.href,
            );
            if (!existingLink) {
                doc.head.appendChild(link);
            }
        }
    });
}

/**
 * 挂载自定义字体
 */
export function mountCustomFont(doc: Document, font: CustomFont): void {
    if (!font.blobUrl) {
        console.warn(`Blob URL not available for font: ${font.name}`);
        return;
    }

    const fontStyleId = `custom-font-${font.id}`;
    let styleElement = doc.getElementById(fontStyleId) as HTMLStyleElement;

    if (!styleElement) {
        styleElement = doc.createElement('style');
        styleElement.id = fontStyleId;
        doc.head.appendChild(styleElement);
    }

    // 获取字体格式
    const format = getFontFormat(font.path);
    const cssFormat = getCSSFormatString(format);
    const fontFamily = createFontFamily(font.family || font.name);
    const fontStyle = font.style || 'normal';
    const fontWeight = font.weight || 400;

    styleElement.textContent = `
    @font-face {
      font-family: "${fontFamily}";
      font-style: ${fontStyle};
      font-weight: ${fontWeight};
      src: url("${font.blobUrl}") format("${cssFormat}");
      font-display: swap;
    }
  `;
}

/**
 * 字体格式类型
 */
export type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2';

/**
 * 获取字体格式
 */
function getFontFormat(path: string): FontFormat {
    const extension = path.toLowerCase().split('.').pop();
    switch (extension) {
        case 'ttf':
            return 'ttf';
        case 'otf':
            return 'otf';
        case 'woff':
            return 'woff';
        case 'woff2':
            return 'woff2';
        default:
            return 'ttf';
    }
}

/**
 * 获取 CSS 格式字符串
 */
function getCSSFormatString(format: FontFormat): string {
    const formats = {
        ttf: 'truetype',
        otf: 'opentype',
        woff: 'woff',
        woff2: 'woff2',
    };
    return formats[format] || 'truetype';
}

/**
 * 创建字体族名称
 */
function createFontFamily(name: string): string {
    return name.replace(/\s+/g, ' ').trim();
}
