CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`format` text NOT NULL,
	`cover` text,
	`storage_type` text NOT NULL,
	`added_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`last_read_at` integer,
	`current_progress` text DEFAULT '{}' NOT NULL,
	`total_characters` integer DEFAULT 0 NOT NULL,
	`read_characters` integer DEFAULT 0 NOT NULL,
	`reading_time` integer DEFAULT 0 NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`rating` real,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "status_check" CHECK("books"."status" IN ('not_started', 'reading', 'completed', 'paused')),
	CONSTRAINT "rating_check" CHECK("books"."rating" IS NULL OR ("books"."rating" >= 0 AND "books"."rating" <= 5)),
	CONSTRAINT "tags_json_check" CHECK(json_valid("books"."tags")),
	CONSTRAINT "current_progress_json_check" CHECK(json_valid("books"."current_progress")),
	CONSTRAINT "books_constraints_check" CHECK("books"."total_characters" >= 0 AND "books"."read_characters" >= 0 AND "books"."read_characters" <= "books"."total_characters" AND "books"."file_size" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_path_unique` ON `books` (`path`);--> statement-breakpoint
CREATE INDEX `idx_books_status` ON `books` (`status`);--> statement-breakpoint
CREATE INDEX `idx_books_added_at` ON `books` (`added_at`);--> statement-breakpoint
CREATE INDEX `idx_books_last_read_at` ON `books` (`last_read_at`);--> statement-breakpoint
CREATE INDEX `idx_books_title` ON `books` (`title`);--> statement-breakpoint
CREATE INDEX `idx_books_author` ON `books` (`author`);--> statement-breakpoint
CREATE INDEX `idx_books_deleted_at` ON `books` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_books_status_added_at` ON `books` (`status`,`added_at`);--> statement-breakpoint
CREATE INDEX `idx_books_status_last_read_at` ON `books` (`status`,`last_read_at`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`content` text NOT NULL,
	`comment_type` text DEFAULT 'note' NOT NULL,
	`position_info` text,
	`selected_text` text,
	`color` text DEFAULT '#ffeb3b',
	`tags` text DEFAULT '[]',
	`is_private` integer DEFAULT 1,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "comment_type_check" CHECK("comments"."comment_type" IN ('note', 'highlight', 'underline', 'strike', 'bookmark', 'review')),
	CONSTRAINT "comments_tags_json_check" CHECK(json_valid("comments"."tags")),
	CONSTRAINT "comments_position_info_json_check" CHECK("comments"."position_info" IS NULL OR json_valid("comments"."position_info"))
);
--> statement-breakpoint
CREATE INDEX `idx_comments_book_id` ON `comments` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_comments_type` ON `comments` (`comment_type`);--> statement-breakpoint
CREATE INDEX `idx_comments_created_at` ON `comments` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_deleted_at` ON `comments` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_book_type_created` ON `comments` (`book_id`,`comment_type`,`created_at`);--> statement-breakpoint
CREATE TABLE `reading_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`start_time` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`end_time` integer,
	`duration` integer DEFAULT 0,
	`start_progress` text,
	`end_progress` text,
	`characters_read` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reading_sessions_constraints_check" CHECK("reading_sessions"."duration" >= 0 AND "reading_sessions"."characters_read" >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_reading_sessions_book_id` ON `reading_sessions` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_reading_sessions_start_time` ON `reading_sessions` (`start_time`);--> statement-breakpoint
CREATE INDEX `idx_reading_sessions_deleted_at` ON `reading_sessions` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_reading_sessions_book_start_time` ON `reading_sessions` (`book_id`,`start_time`);--> statement-breakpoint
CREATE INDEX `idx_reading_sessions_book_end_time` ON `reading_sessions` (`book_id`,`end_time`);

-- ============================================
-- 触发器（自动追加）
-- ============================================

-- @trigger: update_books_updated_at
-- books 表触发器
DROP TRIGGER IF EXISTS update_books_updated_at;
CREATE TRIGGER IF NOT EXISTS update_books_updated_at
AFTER UPDATE OF title, author, format, cover, storage_type, current_progress, total_characters, read_characters, reading_time, file_size, status, tags, rating, notes, last_read_at ON books
FOR EACH ROW
BEGIN
    UPDATE books SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- @trigger: update_comments_updated_at
-- comments 表触发器
DROP TRIGGER IF EXISTS update_comments_updated_at;
CREATE TRIGGER IF NOT EXISTS update_comments_updated_at
AFTER UPDATE OF content, comment_type, position_info, selected_text, color, tags, is_private ON comments
FOR EACH ROW
BEGIN
    UPDATE comments SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- @trigger: update_book_on_session_end
-- readingSessions 表触发器
DROP TRIGGER IF EXISTS update_book_on_session_end;
CREATE TRIGGER IF NOT EXISTS update_book_on_session_end
AFTER UPDATE OF end_time ON reading_sessions
FOR EACH ROW
WHEN NEW.end_time IS NOT NULL AND OLD.end_time IS NULL
BEGIN
    UPDATE books SET
        last_read_at = NEW.end_time,
        current_progress = CASE 
            WHEN NEW.end_progress IS NOT NULL AND json_valid(NEW.end_progress) = 1 
            THEN NEW.end_progress 
            ELSE current_progress 
        END,
        read_characters = CASE
            WHEN NEW.characters_read IS NOT NULL AND NEW.characters_read > 0
            THEN read_characters + NEW.characters_read
            ELSE read_characters
        END,
        status = CASE
            WHEN status = 'completed' THEN 'completed'
            ELSE 'reading'
        END
    WHERE id = NEW.book_id;
END;