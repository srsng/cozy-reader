-- Books 数据库初始 Schema
-- 包含所有表结构、索引、触发器和约束
-- 时间字段使用 INTEGER 类型存储 Unix 时间戳（秒）
-- 包含软删除支持（deleted_at 字段）

-- ============================================
-- 表结构定义
-- ============================================

-- 创建书籍表
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    author TEXT,
    format TEXT NOT NULL,
    cover TEXT,
    storage_type TEXT NOT NULL,
    added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    last_read_at INTEGER,
    current_progress TEXT NOT NULL DEFAULT '{}',
    total_characters INTEGER NOT NULL DEFAULT 0,
    read_characters INTEGER NOT NULL DEFAULT 0,
    reading_time_minutes REAL NOT NULL DEFAULT 0.0,
    file_size INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'not_started' 
        CHECK (status IN ('not_started', 'reading', 'completed', 'paused')),
    tags TEXT NOT NULL DEFAULT '[]',
    rating REAL CHECK (rating >= 0 AND rating <= 5),
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    deleted_at INTEGER
);

-- 创建阅读会话表（用于记录详细的阅读历史）
CREATE TABLE IF NOT EXISTS reading_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    start_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    end_time INTEGER,
    duration_minutes INTEGER DEFAULT 0,
    start_progress TEXT,
    end_progress TEXT,
    characters_read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    deleted_at INTEGER,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 创建评论注释表（用于存储用户阅读时的注释和评论）
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    comment_type TEXT NOT NULL DEFAULT 'note' 
        CHECK (comment_type IN ('note', 'highlight', 'bookmark', 'review')),
    position_info TEXT,
    selected_text TEXT,
    color TEXT DEFAULT '#ffeb3b',
    tags TEXT DEFAULT '[]',
    is_private BOOLEAN DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    deleted_at INTEGER,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ============================================
-- 索引定义
-- ============================================

-- books 表：单列索引
CREATE INDEX IF NOT EXISTS idx_books_path ON books(path);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_added_at ON books(added_at);
CREATE INDEX IF NOT EXISTS idx_books_last_read_at ON books(last_read_at);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_deleted_at ON books(deleted_at);

-- books 表：复合索引
CREATE INDEX IF NOT EXISTS idx_books_status_added_at ON books(status, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_status_last_read_at ON books(status, last_read_at DESC);

-- reading_sessions 表：单列索引
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_start_time ON reading_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_deleted_at ON reading_sessions(deleted_at);

-- reading_sessions 表：复合索引
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_start_time ON reading_sessions(book_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_end_start ON reading_sessions(book_id, end_time, start_time DESC);

-- comments 表：单列索引
CREATE INDEX IF NOT EXISTS idx_comments_book_id ON comments(book_id);
CREATE INDEX IF NOT EXISTS idx_comments_type ON comments(comment_type);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- comments 表：复合索引
CREATE INDEX IF NOT EXISTS idx_comments_book_type_created ON comments(book_id, comment_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_book_created ON comments(book_id, created_at DESC);

-- ============================================
-- 触发器：自动更新 updated_at 字段
-- ============================================

-- books 表的 updated_at 触发器（优化版本：使用 UPDATE OF）
CREATE TRIGGER IF NOT EXISTS update_books_updated_at
AFTER UPDATE OF title, author, format, cover, storage_type, current_progress, 
                 total_characters, read_characters, reading_time_minutes, file_size, 
                 status, tags, rating, notes, last_read_at ON books
FOR EACH ROW
BEGIN
    UPDATE books SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- comments 表的 updated_at 触发器（优化版本：使用 UPDATE OF）
CREATE TRIGGER IF NOT EXISTS update_comments_updated_at
AFTER UPDATE OF content, comment_type, position_info, selected_text, 
                 color, tags, is_private ON comments
FOR EACH ROW
BEGIN
    UPDATE comments SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- ============================================
-- 触发器：CHECK 约束（合并版本）
-- ============================================

-- books 表的 CHECK 约束触发器（合并版本）
CREATE TRIGGER IF NOT EXISTS check_books_constraints
BEFORE INSERT ON books
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.total_characters < 0 THEN
            RAISE(ABORT, 'total_characters must be >= 0')
        WHEN NEW.read_characters < 0 OR NEW.read_characters > NEW.total_characters THEN
            RAISE(ABORT, 'read_characters must be >= 0 and <= total_characters')
        WHEN NEW.file_size < 0 THEN
            RAISE(ABORT, 'file_size must be >= 0')
    END;
END;

CREATE TRIGGER IF NOT EXISTS check_books_constraints_update
BEFORE UPDATE ON books
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.total_characters < 0 THEN
            RAISE(ABORT, 'total_characters must be >= 0')
        WHEN NEW.read_characters < 0 OR NEW.read_characters > NEW.total_characters THEN
            RAISE(ABORT, 'read_characters must be >= 0 and <= total_characters')
        WHEN NEW.file_size < 0 THEN
            RAISE(ABORT, 'file_size must be >= 0')
    END;
END;

-- reading_sessions 表的 CHECK 约束触发器（合并版本）
CREATE TRIGGER IF NOT EXISTS check_reading_sessions_constraints
BEFORE INSERT ON reading_sessions
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.duration_minutes < 0 THEN
            RAISE(ABORT, 'duration_minutes must be >= 0')
        WHEN NEW.characters_read < 0 THEN
            RAISE(ABORT, 'characters_read must be >= 0')
    END;
END;

CREATE TRIGGER IF NOT EXISTS check_reading_sessions_constraints_update
BEFORE UPDATE ON reading_sessions
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.duration_minutes < 0 THEN
            RAISE(ABORT, 'duration_minutes must be >= 0')
        WHEN NEW.characters_read < 0 THEN
            RAISE(ABORT, 'characters_read must be >= 0')
    END;
END;

-- ============================================
-- 触发器：JSON 字段验证
-- ============================================

-- books.tags 字段 JSON 验证
CREATE TRIGGER IF NOT EXISTS validate_books_tags_json
BEFORE INSERT ON books
FOR EACH ROW
WHEN NEW.tags IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.tags) = 0 THEN
            RAISE(ABORT, 'tags must be valid JSON')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_books_tags_json_update
BEFORE UPDATE ON books
FOR EACH ROW
WHEN NEW.tags IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.tags) = 0 THEN
            RAISE(ABORT, 'tags must be valid JSON')
    END;
END;

-- books.current_progress 字段 JSON 验证
CREATE TRIGGER IF NOT EXISTS validate_books_current_progress_json
BEFORE INSERT ON books
FOR EACH ROW
WHEN NEW.current_progress IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.current_progress) = 0 THEN
            RAISE(ABORT, 'current_progress must be valid JSON')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_books_current_progress_json_update
BEFORE UPDATE ON books
FOR EACH ROW
WHEN NEW.current_progress IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.current_progress) = 0 THEN
            RAISE(ABORT, 'current_progress must be valid JSON')
    END;
END;

-- comments.tags 字段 JSON 验证
CREATE TRIGGER IF NOT EXISTS validate_comments_tags_json
BEFORE INSERT ON comments
FOR EACH ROW
WHEN NEW.tags IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.tags) = 0 THEN
            RAISE(ABORT, 'tags must be valid JSON')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_comments_tags_json_update
BEFORE UPDATE ON comments
FOR EACH ROW
WHEN NEW.tags IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.tags) = 0 THEN
            RAISE(ABORT, 'tags must be valid JSON')
    END;
END;

-- comments.position_info 字段 JSON 验证
CREATE TRIGGER IF NOT EXISTS validate_comments_position_info_json
BEFORE INSERT ON comments
FOR EACH ROW
WHEN NEW.position_info IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.position_info) = 0 THEN
            RAISE(ABORT, 'position_info must be valid JSON')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_comments_position_info_json_update
BEFORE UPDATE ON comments
FOR EACH ROW
WHEN NEW.position_info IS NOT NULL
BEGIN
    SELECT CASE
        WHEN json_valid(NEW.position_info) = 0 THEN
            RAISE(ABORT, 'position_info must be valid JSON')
    END;
END;

