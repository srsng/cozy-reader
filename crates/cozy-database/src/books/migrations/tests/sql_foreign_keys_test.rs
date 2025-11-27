#[cfg(test)]
mod tests {
    use crate::books::migrations::tests::setup_test_db;
    use rusqlite::params;

    fn setup_test_db_with_fk() -> rusqlite::Connection {
        let conn = setup_test_db();
        // 启用外键约束
        conn.execute("PRAGMA foreign_keys=ON", []).unwrap();
        conn
    }

    #[test]
    fn test_foreign_key_referential_integrity() {
        let conn = setup_test_db_with_fk();

        // 创建书籍
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        // 测试有效的引用
        let result = conn.execute(
            "INSERT INTO comments (book_id, content, comment_type) VALUES (?, ?, ?)",
            params![1, "Test comment", "note"],
        );
        assert!(result.is_ok(), "Valid foreign key reference should be accepted");

        // 测试无效的引用
        let result = conn.execute(
            "INSERT INTO comments (book_id, content, comment_type) VALUES (?, ?, ?)",
            params![999, "Test comment", "note"],
        );
        assert!(result.is_err(), "Invalid foreign key reference should be rejected");
    }

    #[test]
    fn test_foreign_key_cascade_delete() {
        let conn = setup_test_db_with_fk();

        // 创建书籍和评论
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        conn.execute(
            "INSERT INTO comments (book_id, content, comment_type) VALUES (?, ?, ?)",
            params![1, "Test comment 1", "note"],
        )
        .unwrap();

        conn.execute(
            "INSERT INTO comments (book_id, content, comment_type) VALUES (?, ?, ?)",
            params![1, "Test comment 2", "highlight"],
        )
        .unwrap();

        conn.execute("INSERT INTO reading_sessions (book_id) VALUES (?)", params![1])
            .unwrap();

        // 验证记录存在
        let comment_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM comments WHERE book_id = 1", [], |row| row.get(0))
            .unwrap();
        assert_eq!(comment_count, 2, "Should have 2 comments");

        let session_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM reading_sessions WHERE book_id = 1", [], |row| row.get(0))
            .unwrap();
        assert_eq!(session_count, 1, "Should have 1 reading session");

        // 删除书籍（应该级联删除评论和阅读会话）
        conn.execute("DELETE FROM books WHERE id = 1", []).unwrap();

        // 验证级联删除
        let comment_count_after: i64 = conn
            .query_row("SELECT COUNT(*) FROM comments WHERE book_id = 1", [], |row| row.get(0))
            .unwrap();
        assert_eq!(comment_count_after, 0, "Comments should be cascade deleted");

        let session_count_after: i64 = conn
            .query_row("SELECT COUNT(*) FROM reading_sessions WHERE book_id = 1", [], |row| row.get(0))
            .unwrap();
        assert_eq!(session_count_after, 0, "Reading sessions should be cascade deleted");
    }

    #[test]
    fn test_reading_sessions_foreign_key() {
        let conn = setup_test_db_with_fk();

        // 创建书籍
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        // 测试有效的引用
        let result = conn.execute("INSERT INTO reading_sessions (book_id) VALUES (?)", params![1]);
        assert!(result.is_ok(), "Valid foreign key reference should be accepted");

        // 测试无效的引用
        let result = conn.execute("INSERT INTO reading_sessions (book_id) VALUES (?)", params![999]);
        assert!(result.is_err(), "Invalid foreign key reference should be rejected");
    }
}
