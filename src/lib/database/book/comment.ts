/**
 * 评论注释数据模型
 */
export interface Comment {
	/** 评论唯一标识符 */
	id: number;
	/** 关联的书籍ID */
	book_id: number;
	/** 评论内容 */
	content: string;
	/** 评论类型 */
	comment_type: CommentType;
	/** 位置信息 (JSON字符串，存储章节、页码、字符位置等) */
	position_info?: string;
	/** 选中的文本内容 */
	selected_text?: string;
	/** 高亮颜色 */
	color: string;
	/** 标签 (JSON数组字符串) */
	tags: string;
	/** 是否私有 */
	is_private: boolean;
	/** 创建时间 (ISO 8601 格式) */
	created_at: string;
	/** 更新时间 (ISO 8601 格式) */
	updated_at: string;
}

/**
 * 评论类型枚举
 */
export enum CommentType {
	/** 笔记 */
	NOTE = 'note',
	/** 高亮 */
	HIGHLIGHT = 'highlight',
	/** 书签 */
	BOOKMARK = 'bookmark',
	/** 评价 */
	REVIEW = 'review'
}

/**
 * 位置信息数据结构
 */
export interface PositionInfo {
	/** 章节号 */
	chapter?: number;
	/** 页码 */
	page?: number;
	/** 字符起始位置 */
	start_offset?: number;
	/** 字符结束位置 */
	end_offset?: number;
	/** 段落索引 */
	paragraph_index?: number;
	/** 行号 */
	line_number?: number;
	/** 滚动位置百分比 */
	scroll_percentage?: number;
	/** 自定义位置标记 */
	custom_marker?: string;
}

/**
 * 创建评论时的输入数据
 */
export interface CreateCommentInput {
	book_id: number;
	content: string;
	comment_type?: CommentType;
	position_info?: PositionInfo;
	selected_text?: string;
	color?: string;
	tags?: string[];
	is_private?: boolean;
}

/**
 * 更新评论时的输入数据
 */
export interface UpdateCommentInput {
	content?: string;
	comment_type?: CommentType;
	position_info?: PositionInfo;
	selected_text?: string;
	color?: string;
	tags?: string[];
	is_private?: boolean;
}

/**
 * 评论查询选项
 */
export interface CommentQueryOptions {
	/** 书籍ID筛选 */
	book_id?: number;
	/** 评论类型筛选 */
	comment_type?: CommentType;
	/** 搜索关键词 */
	search?: string;
	/** 标签筛选 */
	tags?: string[];
	/** 是否私有筛选 */
	is_private?: boolean;
	/** 排序字段 */
	sort_by?: 'created_at' | 'updated_at' | 'comment_type';
	/** 排序方向 */
	sort_order?: 'asc' | 'desc';
	/** 分页偏移量 */
	offset?: number;
	/** 分页限制 */
	limit?: number;
}

/**
 * 评论统计信息
 */
export interface CommentStatistics {
	/** 总评论数 */
	total_comments: number;
	/** 各类型评论数量 */
	comments_by_type: Record<CommentType, number>;
	/** 最近评论数量 */
	recent_comments_count: number;
	/** 平均每本书的评论数 */
	average_comments_per_book: number;
}

/**
 * 书籍评论摘要
 */
export interface BookCommentSummary {
	/** 书籍ID */
	book_id: number;
	/** 书籍标题 */
	book_title: string;
	/** 总评论数 */
	total_comments: number;
	/** 各类型评论数量 */
	comments_by_type: Record<CommentType, number>;
	/** 最新评论时间 */
	last_comment_at?: string;
}