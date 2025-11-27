#[cfg(test)]
mod tests {
    use crate::books::migrations::tests::execute_sql;
    use rusqlite::Connection;

    #[test]
    fn test_m001_initial_schema_sql_syntax() {
        let sql = include_str!("../m001_initial_schema.sql");
        let conn = Connection::open_in_memory().unwrap();

        // 执行 SQL，如果语法错误会 panic
        execute_sql(&conn, sql);

        // 验证数据库已创建
        let table_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        assert!(table_count >= 3, "Should have at least 3 tables");
    }
}
