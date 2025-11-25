/** 使用纯文本作为内容的书籍格式 */
export enum BookFormatTextType {
    /** 纯文本格式 */
    TXT = 'txt',
    /** Markdown格式 1 */
    MARKDOWN = 'markdown',
    /** Markdown格式 2 */
    MD = 'md',
    /** HTML格式 */
    HTML = 'html'
}

export enum BookFormatExtra {
    /** EPUB电子书格式 */
    EPUB = 'epub',
    /** PDF格式 */
    PDF = 'pdf'
}

/**
 * 书籍格式枚举
 */
export enum BookFormat {
    /** 纯文本格式 */
    TXT = 'txt',
    /** Markdown格式 1 */
    MARKDOWN = 'markdown',
    /** Markdown格式 2 */
    MD = 'md',
    /** HTML格式 */
    HTML = 'html',
    /** EPUB电子书格式 */
    EPUB = 'epub',
    /** PDF格式 */
    PDF = 'pdf'
}
/** 支持的书籍格式的字符串列表 */
export const BookFormatNames: BookFormat[] = Object.values(BookFormat);

export const BookFormatSupportFmt = `${BookFormat}`;

/** 使用纯文本作为内容的书籍格式 */
export const BookFormatTextTypes: BookFormatTextType[] = Object.values(BookFormatTextType);

/** 检查文件格式是否支持 */
export function isSupportFormat(filepath: string): boolean {
    const format = getFileFormat(filepath);
    return BookFormatNames.includes(format as any);
}

export function isTextBook(filepath: string): boolean {
    const format = getFileFormat(filepath);
    return BookFormatTextTypes.includes(format as BookFormatTextType);
}

/** 获取文件格式 */
export function getFileFormat(filepath: string): string {
    const format = filepath.split('.').pop()?.toLowerCase();
    return format || '';
}

/**
 * 存储方式枚举
 */
export enum StorageType {
    /** 文件系统存储 */
    FILESYSTEM = 'filesystem',
    /** 本地存储 */
    LOCALSTORAGE = 'localstorage',
    /** 云存储 */
    CLOUD = 'cloud',
    /** 数据库存储 */
    DATABASE = 'database'
}

/**
 * 书籍数据模型
 */
export interface Book {
    /** 书籍唯一标识符 */
    id: number;
    /** 书籍文件路径 */
    path: string;
    /** 书籍标题 */
    title: string;
    /** 书籍作者 */
    author?: string;
    /** 书籍格式 */
    format: BookFormat;
    /** 封面 base64 */
    cover?: string;
    /** 存储方式 */
    storage_type: StorageType;
    /** 加入时间 (Unix 时间戳，秒) */
    added_at: number;
    /** 最后阅读时间 (Unix 时间戳，秒) */
    last_read_at?: number;
    /** 当前阅读进度 (JSON 字符串，可存储章节、页码等信息) */
    current_progress: string;
    /** 总字符数 */
    total_characters: number;
    /** 已读字符数 */
    read_characters: number;
    /** 阅读时长 (分钟) */
    reading_time_minutes: number;
    /** 书籍大小 (字节) */
    file_size: number;
    /** 书籍状态 */
    status: BookStatus;
    /** 书籍标签 (JSON 数组字符串) */
    tags: string;
    /** 书籍评分 (0~5) */
    rating?: number;
    /** 书籍备注 */
    notes?: string;
    /** 创建时间 (Unix 时间戳，秒) */
    created_at: number;
    /** 更新时间 (Unix 时间戳，秒) */
    updated_at: number;
    /** 删除时间 (Unix 时间戳，秒，NULL 表示未删除) */
    deleted_at?: number;
}

/**
 * 书籍状态枚举
 */
export enum BookStatus {
    /** 未开始 */
    NOT_STARTED = 'not_started',
    /** 阅读中 */
    READING = 'reading',
    /** 已完成 */
    COMPLETED = 'completed',
    /** 已暂停 */
    PAUSED = 'paused'
}

/**
 * 创建新书籍时的输入数据
 */
export interface CreateBookInput {
    path: string;
    title: string;
    author?: string;
    format: BookFormat;
    storage_type: StorageType;
    current_progress?: string;
    total_characters?: number;
    file_size?: number;
    tags?: string[];
    rating?: number;
    notes?: string;
    cover?: string;
}

/**
 * 更新书籍时的输入数据
 */
export interface UpdateBookInput {
    title?: string;
    author?: string;
    format?: BookFormat;
    storage_type?: StorageType;
    current_progress?: string;
    read_characters?: number;
    reading_time_minutes?: number;
    status?: BookStatus;
    tags?: string[];
    rating?: number;
    notes?: string;
    cover?: string;
}

/**
 * 阅读进度数据结构
 */
export interface ReadingProgress {
    /** 当前章节 */
    chapter?: number;
    /** 当前页码 */
    page?: number;
    /** 当前位置百分比 */
    percentage?: number;
    /** 当前滚动位置 */
    scroll_position?: number;
    /** 自定义位置标记 */
    custom_marker?: string;
}

/**
 * 书籍统计信息
 */
export interface BookStatistics {
    /** 总阅读时长 (分钟) */
    total_reading_time: number;
    /** 平均阅读速度 (字符/分钟) */
    average_reading_speed: number;
    /** 阅读进度百分比 */
    progress_percentage: number;
    /** 预计剩余阅读时间 (分钟) */
    estimated_remaining_time: number;
}

/**
 * 书籍查询选项
 */
export interface BookQueryOptions {
    /** 搜索关键词 */
    search?: string;
    /** 状态筛选 */
    status?: BookStatus;
    /** 标签筛选 */
    tags?: string[];
    /** 排序字段 */
    sort_by?: 'title' | 'author' | 'added_at' | 'last_read_at' | 'rating';
    /** 排序方向 */
    sort_order?: 'asc' | 'desc';
    /** 分页偏移量 */
    offset?: number;
    /** 分页限制 */
    limit?: number;
}
