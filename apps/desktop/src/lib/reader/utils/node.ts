/**
 * DOM 节点相关工具函数
 */

/**
 * 创建节点过滤器，用于搜索时排除特定节点
 * @param options 过滤选项
 * @returns 节点过滤器函数
 */
export function createRejectFilter({
    tags = [],
    classes = [],
    attributes = [],
    contents = []
}: {
    tags?: string[];
    classes?: string[];
    attributes?: string[];
    contents?: { tag: string; content: RegExp }[];
}): (node: Node) => number {
    return (node: Node): number => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const name = (node as Element).tagName.toLowerCase();
            // 默认排除 script 和 style 标签
            if (name === 'script' || name === 'style') {
                return NodeFilter.FILTER_REJECT;
            }
            // 排除指定的标签
            if (tags.includes(name)) {
                return NodeFilter.FILTER_REJECT;
            }
            // 排除包含指定 class 的元素
            if (classes.some((cls) => (node as Element).classList.contains(cls))) {
                return NodeFilter.FILTER_REJECT;
            }
            // 排除包含指定属性的元素
            if (attributes.some((attr) => (node as Element).hasAttribute(attr))) {
                return NodeFilter.FILTER_REJECT;
            }
            // 排除内容匹配指定正则的元素
            if (
                contents.some(({ tag, content }) => {
                    return name === tag && content.test((node as Element).textContent || '');
                })
            ) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
    };
}
