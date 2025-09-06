// 数据库配置和连接
export {
	getDatabase,
	closeDatabase,
	isDatabaseConnected,
	DB_BOOKS_CONFIG as DATABASE_CONFIG
} from './config';

// 书籍相关类型和服务
export type {
	Book,
	CreateBookInput,
	UpdateBookInput,
	BookQueryOptions,
	BookStatistics,
	ReadingProgress
} from './book';
export {
	BookStatus,
	BookFormat,
	StorageType,
	BookFormatSupportFmt,
	isSupportFormat,
	getFileFormat
} from './book';
export { BookService } from './bookService';

// 阅读会话相关类型和服务
export type {
	ReadingSession,
	CreateReadingSessionInput,
	EndReadingSessionInput,
	ReadingSessionStats
} from './readingSessionService';
export { ReadingSessionService } from './readingSessionService';

// 评论注释相关类型和服务
export type {
	Comment,
	CommentType,
	CreateCommentInput,
	UpdateCommentInput,
	CommentQueryOptions,
	CommentStatistics,
	BookCommentSummary,
	PositionInfo
} from './comment';
export { CommentService } from './commentService';

// 便捷的初始化函数
export async function initializeBooksDatabase() {
	try {
		const { getDatabase } = await import('./config');
		await getDatabase();
		console.log('Book Database initialized successfully');
		return true;
	} catch (error) {
		console.error('Failed to initialize Book database:', error);
		return false;
	}
}
