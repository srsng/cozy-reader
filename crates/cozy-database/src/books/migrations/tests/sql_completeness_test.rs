#[cfg(test)]
mod tests {
    use crate::books::migrations::tests::{index_exists, setup_test_db, table_exists, trigger_exists};

    #[test]
    fn test_m001_initial_schema_completeness() {
        let conn = setup_test_db();

        // 验证表
        let expected_tables = vec!["books", "comments", "reading_sessions"];
        for table in expected_tables {
            assert!(table_exists(&conn, table), "Table {} should exist", table);
        }

        // 验证索引
        let expected_indexes = vec![
            "idx_books_path",
            "idx_books_status",
            "idx_books_added_at",
            "idx_books_status_added_at",
            "idx_comments_book_id",
            "idx_reading_sessions_book_id",
        ];
        for index in expected_indexes {
            assert!(index_exists(&conn, index), "Index {} should exist", index);
        }

        // 验证触发器
        let expected_triggers = vec![
            "update_books_updated_at",
            "check_books_constraints",
            "validate_books_tags_json",
            "update_comments_updated_at",
        ];
        for trigger in expected_triggers {
            assert!(trigger_exists(&conn, trigger), "Trigger {} should exist", trigger);
        }

        // 验证外键约束（通过检查表定义）
        let comments_sql: Option<String> = conn
            .query_row(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name='comments'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert!(
            comments_sql.map(|s| s.contains("FOREIGN KEY")).unwrap_or(false),
            "comments table should have foreign key"
        );
    }
}
