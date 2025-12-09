/**
 * 网格布局工具函数
 * 用于计算多书籍视图的网格布局
 */

export interface GridTemplate {
    columns: string;
    rows: string;
}

export interface InsetEdges {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
}

/**
 * 获取网格模板
 * @param count 书籍数量
 * @param aspectRatio 宽高比（width / height）
 * @returns 网格模板
 */
export const getGridTemplate = (count: number, aspectRatio: number): GridTemplate => {
    if (count <= 1) {
        return { columns: '1fr', rows: '1fr' };
    } else if (count === 2) {
        return aspectRatio < 1
            ? { columns: '1fr', rows: '1fr 1fr' }
            : { columns: '1fr 1fr', rows: '1fr' };
    } else if (count === 3 || count === 4) {
        return { columns: '1fr 1fr', rows: '1fr 1fr' };
    } else {
        return { columns: '1fr 1fr 1fr', rows: '1fr 1fr 1fr' };
    }
};

/**
 * 获取边距边缘
 * @param index 当前索引
 * @param count 总数
 * @param aspectRatio 宽高比
 * @returns 边距边缘信息
 */
export const getInsetEdges = (index: number, count: number, aspectRatio: number): InsetEdges => {
    const gridTemplate = getGridTemplate(count, aspectRatio);
    const cols = gridTemplate.columns.split(' ').length;
    const rows = gridTemplate.rows.split(' ').length;

    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
        top: row === 0,
        right: col === cols - 1,
        bottom: row === rows - 1,
        left: col === 0,
    };
};
