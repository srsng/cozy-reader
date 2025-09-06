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
	/** 加入时间 (ISO 8601 格式) */
	added_at: string;
	/** 最后阅读时间 (ISO 8601 格式) */
	last_read_at?: string;
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
	/** 书籍评分 (1-5) */
	rating?: number;
	/** 书籍备注 */
	notes?: string;
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
	current_progress?: string;
	total_characters?: number;
	file_size?: number;
	tags?: string[];
	rating?: number;
	notes?: string;
}

/**
 * 更新书籍时的输入数据
 */
export interface UpdateBookInput {
	title?: string;
	author?: string;
	current_progress?: string;
	read_characters?: number;
	reading_time_minutes?: number;
	status?: BookStatus;
	tags?: string[];
	rating?: number;
	notes?: string;
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