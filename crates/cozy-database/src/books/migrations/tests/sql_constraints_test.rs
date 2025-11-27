#[cfg(test)]
mod tests {
    use crate::books::migrations::tests::setup_test_db;
    use rusqlite::params;

    #[test]
    fn test_books_status_constraint() {
        let conn = setup_test_db();

        // 测试有效的枚举值
        let valid_statuses = vec!["not_started", "reading", "completed", "paused"];
        for status in valid_statuses {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, status) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", status), "Test", "txt", "filesystem", status],
            );
            assert!(result.is_ok(), "Status '{}' should be valid", status);

            // 清理
            conn.execute("DELETE FROM books WHERE path = ?", params![format!("/test_{}.txt", status)])
                .unwrap();
        }

        // 测试无效的枚举值
        let invalid_statuses = vec!["invalid_status", "INVALID", ""];
        for status in invalid_statuses {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, status) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", status), "Test", "txt", "filesystem", status],
            );
            assert!(result.is_err(), "Status '{}' should be rejected", status);
        }
    }

    #[test]
    fn test_books_rating_constraint() {
        let conn = setup_test_db();

        // 测试有效范围
        let valid_ratings = vec![0.0, 2.5, 5.0];
        for rating in valid_ratings {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, rating) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", rating), "Test", "txt", "filesystem", rating],
            );
            assert!(result.is_ok(), "Rating {} should be valid", rating);

            // 清理
            conn.execute("DELETE FROM books WHERE path = ?", params![format!("/test_{}.txt", rating)])
                .unwrap();
        }

        // 测试无效范围
        let invalid_ratings = vec![-1.0, 6.0, 10.0];
        for rating in invalid_ratings {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, rating) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", rating), "Test", "txt", "filesystem", rating],
            );
            assert!(result.is_err(), "Rating {} should be rejected", rating);
        }

        // NULL 应该被允许（rating 可为空）
        let result = conn.execute(
            "INSERT INTO books (path, title, format, storage_type, rating) VALUES (?, ?, ?, ?, ?)",
            params!["/test_null.txt", "Test", "txt", "filesystem", None::<f64>],
        );
        assert!(result.is_ok(), "NULL rating should be allowed");
    }

    #[test]
    fn test_comments_comment_type_constraint() {
        let conn = setup_test_db();

        // 先创建一个书籍
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        // 测试有效的枚举值
        let valid_types = vec!["note", "highlight", "bookmark", "review"];
        for comment_type in valid_types {
            let result = conn.execute(
                "INSERT INTO comments (book_id, content, comment_type) VALUES (?, ?, ?)",
                params![1, "Test comment", comment_type],
            );
            assert!(result.is_ok(), "Comment type '{}' should be valid", comment_type);

            // 清理
            conn.execute("DELETE FROM comments WHERE book_id = 1", []).unwrap();
        }

        // 测试无效的枚举值
        let invalid_types = vec!["invalid_type", "INVALID", ""];
        for comment_type in invalid_types {
            let result = conn.execute(
                "INSERT INTO comments (book_id, content, comment_type) VALUES (?, ?, ?)",
                params![1, "Test comment", comment_type],
            );
            assert!(result.is_err(), "Comment type '{}' should be rejected", comment_type);
        }
    }

    #[test]
    fn test_books_numeric_constraints_via_trigger() {
        let conn = setup_test_db();

        // 测试 total_characters >= 0
        let result = conn.execute(
            "INSERT INTO books (path, title, format, storage_type, total_characters) VALUES (?, ?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem", -1],
        );
        assert!(result.is_err(), "total_characters < 0 should be rejected");

        // 测试 read_characters <= total_characters
        let result = conn.execute(
            "INSERT INTO books (path, title, format, storage_type, total_characters, read_characters) VALUES (?, ?, ?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem", 100, 101],
        );
        assert!(result.is_err(), "read_characters > total_characters should be rejected");

        // 测试有效值
        let result = conn.execute(
            "INSERT INTO books (path, title, format, storage_type, total_characters, read_characters) VALUES (?, ?, ?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem", 100, 50],
        );
        assert!(result.is_ok(), "Valid numeric values should be accepted");
    }

    #[test]
    fn test_reading_sessions_numeric_constraints_via_trigger() {
        let conn = setup_test_db();

        // 先创建一个书籍
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        // 测试 duration_minutes >= 0
        let result = conn.execute(
            "INSERT INTO reading_sessions (book_id, duration_minutes) VALUES (?, ?)",
            params![1, -1],
        );
        assert!(result.is_err(), "duration_minutes < 0 should be rejected");

        // 测试 characters_read >= 0
        let result = conn.execute(
            "INSERT INTO reading_sessions (book_id, characters_read) VALUES (?, ?)",
            params![1, -1],
        );
        assert!(result.is_err(), "characters_read < 0 should be rejected");

        // 测试有效值
        let result = conn.execute(
            "INSERT INTO reading_sessions (book_id, duration_minutes, characters_read) VALUES (?, ?, ?)",
            params![1, 30, 1000],
        );
        assert!(result.is_ok(), "Valid numeric values should be accepted");
    }
}
