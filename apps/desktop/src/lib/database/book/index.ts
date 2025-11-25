// 数据库配置和连接
export {
    getDatabase,
    closeDatabase,
    isDatabaseConnected,
    DB_BOOKS_CONFIG
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
    BookFormatTextType,
    BookFormatTextTypes,
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

export { addBookByFsPath, DatabaseUtils as BookDbUtils, findBooksByTag, findBooksByTags } from './utils';

