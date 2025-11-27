#[cfg(test)]
mod tests {
    use crate::books::migrations::tests::setup_test_db;
    use rusqlite::params;
    use std::thread;
    use std::time::Duration;

    #[test]
    fn test_books_updated_at_trigger() {
        let conn = setup_test_db();

        // 插入记录
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        let initial_updated_at: i64 = conn
            .query_row("SELECT updated_at FROM books WHERE id = 1", [], |row| row.get(0))
            .unwrap();

        // 等待一秒，确保时间戳会变化
        thread::sleep(Duration::from_secs(1));

        // 更新记录（触发 updated_at 触发器）
        conn.execute("UPDATE books SET title = ? WHERE id = 1", params!["Updated Title"])
            .unwrap();

        let new_updated_at: i64 = conn
            .query_row("SELECT updated_at FROM books WHERE id = 1", [], |row| row.get(0))
            .unwrap();

        assert!(
            new_updated_at > initial_updated_at,
            "updated_at should be updated after modifying title"
        );

        // 验证 updated_at 没有被不相关的字段更新触发
        let updated_at_before: i64 = conn
            .query_row("SELECT updated_at FROM books WHERE id = 1", [], |row| row.get(0))
            .unwrap();

        thread::sleep(Duration::from_millis(100));

        // 更新 deleted_at（不在触发器列表中）
        conn.execute("UPDATE books SET deleted_at = ? WHERE id = 1", params![initial_updated_at])
            .unwrap();

        let updated_at_after: i64 = conn
            .query_row("SELECT updated_at FROM books WHERE id = 1", [], |row| row.get(0))
            .unwrap();

        assert_eq!(
            updated_at_before, updated_at_after,
            "updated_at should NOT be updated when modifying deleted_at"
        );
    }

    #[test]
    fn test_comments_updated_at_trigger() {
        let conn = setup_test_db();

        // 先创建一个书籍
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        // 插入评论
        conn.execute(
            "INSERT INTO comments (book_id, content, comment_type) VALUES (?, ?, ?)",
            params![1, "Test comment", "note"],
        )
        .unwrap();

        let initial_updated_at: i64 = conn
            .query_row("SELECT updated_at FROM comments WHERE id = 1", [], |row| row.get(0))
            .unwrap();

        // 等待一秒
        thread::sleep(Duration::from_secs(1));

        // 更新评论（触发 updated_at 触发器）
        conn.execute("UPDATE comments SET content = ? WHERE id = 1", params!["Updated comment"])
            .unwrap();

        let new_updated_at: i64 = conn
            .query_row("SELECT updated_at FROM comments WHERE id = 1", [], |row| row.get(0))
            .unwrap();

        assert!(
            new_updated_at > initial_updated_at,
            "updated_at should be updated after modifying content"
        );
    }

    #[test]
    fn test_books_tags_json_validation_trigger() {
        let conn = setup_test_db();

        // 测试有效的 JSON
        let valid_jsons = vec!["[]", r#"["tag1", "tag2"]"#, "{}"];
        for json_str in valid_jsons {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, tags) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", json_str), "Test", "txt", "filesystem", json_str],
            );
            assert!(result.is_ok(), "Valid JSON '{}' should be accepted", json_str);

            // 清理
            conn.execute("DELETE FROM books WHERE path = ?", params![format!("/test_{}.txt", json_str)])
                .unwrap();
        }

        // 测试无效的 JSON
        let invalid_jsons = vec!["not json", "{invalid}", "[unclosed"];
        for json_str in invalid_jsons {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, tags) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", json_str), "Test", "txt", "filesystem", json_str],
            );
            assert!(result.is_err(), "Invalid JSON '{}' should be rejected", json_str);
        }
    }

    #[test]
    fn test_books_current_progress_json_validation_trigger() {
        let conn = setup_test_db();

        // 测试有效的 JSON
        let valid_jsons = vec!["{}", r#"{"page": 1, "chapter": 2}"#];
        for json_str in valid_jsons {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, current_progress) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", json_str.len()), "Test", "txt", "filesystem", json_str],
            );
            assert!(result.is_ok(), "Valid JSON '{}' should be accepted", json_str);

            // 清理
            conn.execute("DELETE FROM books WHERE path = ?", params![format!("/test_{}.txt", json_str.len())])
                .unwrap();
        }

        // 测试无效的 JSON
        let invalid_jsons = vec!["not json", "{invalid}", "[unclosed"];
        for json_str in invalid_jsons {
            let result = conn.execute(
                "INSERT INTO books (path, title, format, storage_type, current_progress) VALUES (?, ?, ?, ?, ?)",
                params![format!("/test_{}.txt", json_str.len()), "Test", "txt", "filesystem", json_str],
            );
            assert!(result.is_err(), "Invalid JSON '{}' should be rejected", json_str);
        }
    }

    #[test]
    fn test_comments_tags_json_validation_trigger() {
        let conn = setup_test_db();

        // 先创建一个书籍
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        // 测试有效的 JSON
        let valid_jsons = vec!["[]", r#"["tag1", "tag2"]"#];
        for json_str in valid_jsons {
            let result = conn.execute(
                "INSERT INTO comments (book_id, content, comment_type, tags) VALUES (?, ?, ?, ?)",
                params![1, "Test comment", "note", json_str],
            );
            assert!(result.is_ok(), "Valid JSON '{}' should be accepted", json_str);

            // 清理
            conn.execute("DELETE FROM comments WHERE book_id = 1", []).unwrap();
        }

        // 测试无效的 JSON
        let invalid_jsons = vec!["not json", "{invalid}"];
        for json_str in invalid_jsons {
            let result = conn.execute(
                "INSERT INTO comments (book_id, content, comment_type, tags) VALUES (?, ?, ?, ?)",
                params![1, "Test comment", "note", json_str],
            );
            assert!(result.is_err(), "Invalid JSON '{}' should be rejected", json_str);
        }
    }

    #[test]
    fn test_comments_position_info_json_validation_trigger() {
        let conn = setup_test_db();

        // 先创建一个书籍
        conn.execute(
            "INSERT INTO books (path, title, format, storage_type) VALUES (?, ?, ?, ?)",
            params!["/test.txt", "Test", "txt", "filesystem"],
        )
        .unwrap();

        // 测试有效的 JSON
        let valid_jsons = vec![
            r#"{"page": 1, "line": 10}"#,
            r#"{"chapter": 2, "paragraph": 5}"#,
        ];
        for json_str in valid_jsons {
            let result = conn.execute(
                "INSERT INTO comments (book_id, content, comment_type, position_info) VALUES (?, ?, ?, ?)",
                params![1, "Test comment", "note", json_str],
            );
            assert!(result.is_ok(), "Valid JSON '{}' should be accepted", json_str);

            // 清理
            conn.execute("DELETE FROM comments WHERE book_id = 1", []).unwrap();
        }

        // 测试无效的 JSON
        let invalid_jsons = vec!["not json", "{invalid}"];
        for json_str in invalid_jsons {
            let result = conn.execute(
                "INSERT INTO comments (book_id, content, comment_type, position_info) VALUES (?, ?, ?, ?)",
                params![1, "Test comment", "note", json_str],
            );
            assert!(result.is_err(), "Invalid JSON '{}' should be rejected", json_str);
        }

        // NULL 应该被允许
        let result = conn.execute(
            "INSERT INTO comments (book_id, content, comment_type, position_info) VALUES (?, ?, ?, ?)",
            params![1, "Test comment", "note", None::<String>],
        );
        assert!(result.is_ok(), "NULL position_info should be allowed");
    }
}
