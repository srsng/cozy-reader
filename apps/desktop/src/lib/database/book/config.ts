import Database from '@tauri-apps/plugin-sql';
import type { DatabaseConfig } from '../types';

/**
 * 数据库配置
 */
export const DB_BOOKS_CONFIG: DatabaseConfig = {
	/** 数据库文件名 */
	filename: 'books.db',
	/** 数据库版本 */
	version: 1.0,
	/** 是否启用 WAL 模式 */
	wal: true
};

/**
 * 数据库实例
 */
let dbInstance: Database | null = null;

/**
 * 获取数据库实例
 */
export async function getDatabase(): Promise<Database> {
	if (!dbInstance) {
		dbInstance = await Database.load(`sqlite:${DB_BOOKS_CONFIG.filename}`);

		// 启用 WAL 模式以提高并发性能
		if (DB_BOOKS_CONFIG.wal) {
			await dbInstance.execute('PRAGMA journal_mode=WAL;');
		}

		// 启用外键约束
		await dbInstance.execute('PRAGMA foreign_keys=ON;');

		// 初始化数据库表
		await initializeDatabase(dbInstance);
	}

	return dbInstance;
}

/**
 * 初始化数据库表结构
 */
async function initializeDatabase(db: Database): Promise<void> {
	// 创建书籍表
	await db.execute(`
		CREATE TABLE IF NOT EXISTS books (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			path TEXT NOT NULL UNIQUE,
			title TEXT NOT NULL,
			author TEXT,
			format TEXT NOT NULL,
			cover TEXT,
			storage_type TEXT NOT NULL,
			added_at TEXT NOT NULL DEFAULT (datetime('now')),
			last_read_at TEXT,
			current_progress TEXT NOT NULL DEFAULT '{}',
			total_characters INTEGER NOT NULL DEFAULT 0,
			read_characters INTEGER NOT NULL DEFAULT 0,
				reading_time_minutes REAL NOT NULL DEFAULT 0.0,
			file_size INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'reading', 'completed', 'paused')),
			tags TEXT NOT NULL DEFAULT '[]',
				rating REAL CHECK (rating >= 0 AND rating <= 5),
			notes TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);

	// todo: remove
	// -------------------------------------------------------
	// 添加cover字段（如果不存在）
	try {
		await db.execute('ALTER TABLE books ADD COLUMN cover TEXT;');
	} catch (error) {
		// 字段可能已存在，忽略错误
	}

	// 添加format字段（如果不存在）
	try {
		await db.execute('ALTER TABLE books ADD COLUMN format TEXT;');
	} catch (error) {
		// 字段可能已存在，忽略错误
	}

	// 添加storage_type字段（如果不存在）
	try {
		await db.execute('ALTER TABLE books ADD COLUMN storage_type TEXT;');
	} catch (error) {
		// 字段可能已存在，忽略错误
	}
	// -------------------------------------------------------

	// 创建索引以提高查询性能
	await db.execute('CREATE INDEX IF NOT EXISTS idx_books_path ON books(path);');
	await db.execute('CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);');
	await db.execute('CREATE INDEX IF NOT EXISTS idx_books_added_at ON books(added_at);');
	await db.execute('CREATE INDEX IF NOT EXISTS idx_books_last_read_at ON books(last_read_at);');
	await db.execute('CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);');
	await db.execute('CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);');

	// 创建触发器自动更新 updated_at 字段
	await db.execute(`
		CREATE TRIGGER IF NOT EXISTS update_books_updated_at
		AFTER UPDATE ON books
		FOR EACH ROW
		BEGIN
			UPDATE books SET updated_at = datetime('now') WHERE id = NEW.id;
		END;
	`);

	// 创建阅读会话表（用于记录详细的阅读历史）
	await db.execute(`
		CREATE TABLE IF NOT EXISTS reading_sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			book_id INTEGER NOT NULL,
			start_time TEXT NOT NULL DEFAULT (datetime('now')),
			end_time TEXT,
			duration_minutes INTEGER DEFAULT 0,
			start_progress TEXT,
			end_progress TEXT,
			characters_read INTEGER DEFAULT 0,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
		);
	`);

	await db.execute(
		'CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id);'
	);
	await db.execute(
		'CREATE INDEX IF NOT EXISTS idx_reading_sessions_start_time ON reading_sessions(start_time);'
	);

	// 创建评论注释表（用于存储用户阅读时的注释和评论）
	await db.execute(`
		CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			book_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			comment_type TEXT NOT NULL DEFAULT 'note' CHECK (comment_type IN ('note', 'highlight', 'bookmark', 'review')),
			position_info TEXT,
			selected_text TEXT,
			color TEXT DEFAULT '#ffeb3b',
			tags TEXT DEFAULT '[]',
			is_private BOOLEAN DEFAULT 1,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
		);
	`);

	// 创建评论表的索引
	await db.execute('CREATE INDEX IF NOT EXISTS idx_comments_book_id ON comments(book_id);');
	await db.execute('CREATE INDEX IF NOT EXISTS idx_comments_type ON comments(comment_type);');
	await db.execute('CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);');

	// 创建触发器自动更新 comments 表的 updated_at 字段
	await db.execute(`
		CREATE TRIGGER IF NOT EXISTS update_comments_updated_at
		AFTER UPDATE ON comments
		FOR EACH ROW
		BEGIN
			UPDATE comments SET updated_at = datetime('now') WHERE id = NEW.id;
		END;
	`);
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
	if (dbInstance) {
		await dbInstance.close();
		dbInstance = null;
	}
}

/**
 * 检查数据库连接状态
 */
export function isDatabaseConnected(): boolean {
	return dbInstance !== null;
}
