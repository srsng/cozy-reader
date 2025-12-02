/**
 * Books 数据库触发器定义
 * 使用触发器 DSL 结构化定义，提升可读性和可维护性
 */

import { sql } from 'drizzle-orm';
import {
    createTrigger,
    updatedAtTrigger,
    type TriggerConfig,
    type TriggerDefinition,
} from '../../scripts/trigger-dsl';

// ============================================
// Books 表触发器
// ============================================

// 自动更新 updated_at 字段触发器
export const booksUpdatedAtTrigger = updatedAtTrigger('books', [
    'title',
    'author',
    'format',
    'cover',
    'storage_type',
    'current_progress',
    'total_characters',
    'read_characters',
    'reading_time',
    'file_size',
    'status',
    'tags',
    'rating',
    'notes',
    'last_read_at',
]);

// ============================================
// Comments 表触发器
// ============================================

// 自动更新 updated_at 字段触发器
export const commentsUpdatedAtTrigger = updatedAtTrigger('comments', [
    'content',
    'comment_type',
    'position_info',
    'selected_text',
    'color',
    'tags',
    'is_private',
]);

// ============================================
// Reading Sessions 表触发器
// ============================================
// 注意：Reading Sessions 表没有 updated_at 字段，因此不需要 updated_at 触发器

// 会话结束时更新书籍统计触发器
export const readingSessionsUpdateBookTrigger: TriggerDefinition = {
    name: 'update_book_on_session_end',
    timing: 'AFTER',
    event: 'UPDATE',
    table: 'reading_sessions',
    columns: ['end_time'],
    when: 'NEW.end_time IS NOT NULL AND OLD.end_time IS NULL',
    body: `UPDATE books SET
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
WHERE id = NEW.book_id;`
};

// ============================================
// 导出所有触发器 SQL
// ============================================

// Books 表所有触发器
export const booksTriggers = sql`
-- 触发器：自动更新 updated_at 字段
${createTrigger(booksUpdatedAtTrigger)}
`;

// Comments 表所有触发器
export const commentsTriggers = sql`
-- 触发器：自动更新 updated_at 字段
${createTrigger(commentsUpdatedAtTrigger)}
`;

// Reading Sessions 表所有触发器
export const readingSessionsTriggers = sql`
-- 触发器：会话结束时更新书籍统计
${createTrigger(readingSessionsUpdateBookTrigger)}
`;

// ============================================
// 导出统一格式的触发器配置
// ============================================

/**
 * 触发器配置对象
 * 包含数据库名称和所有表的触发器 SQL
 */
export const triggersConfig: TriggerConfig = {
    dbName: 'books',
    triggers: {
        books: booksTriggers,
        comments: commentsTriggers,
        readingSessions: readingSessionsTriggers,
    },
};

