use rusqlite::Connection;

/// 执行 SQL 语句的辅助函数
/// 使用 rusqlite 的 execute_batch 方法，它专门设计用于执行多语句 SQL
pub fn execute_sql(conn: &Connection, sql: &str) {
    // 移除注释行
    let cleaned_sql: String = sql
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !trimmed.starts_with("--") && !trimmed.is_empty()
        })
        .collect::<Vec<_>>()
        .join("\n");

    // 使用 rusqlite 的 execute_batch 方法执行 SQL
    conn.execute_batch(&cleaned_sql).expect("Failed to execute SQL");
}

/// 设置测试数据库（执行所有迁移）
/// 返回 rusqlite Connection，因为 execute_batch 需要它
pub fn setup_test_db() -> Connection {
    let sql = include_str!("../m001_initial_schema.sql");
    
    // 移除注释行
    let cleaned_sql: String = sql
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !trimmed.starts_with("--") && !trimmed.is_empty()
        })
        .collect::<Vec<_>>()
        .join("\n");
    
    let conn = Connection::open_in_memory().unwrap();
    conn.execute_batch(&cleaned_sql).unwrap();
    conn
}

/// 验证表是否存在
pub fn table_exists(conn: &Connection, table_name: &str) -> bool {
    conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name=?)",
        [table_name],
        |row| row.get::<_, bool>(0),
    )
    .unwrap()
}

/// 验证索引是否存在
pub fn index_exists(conn: &Connection, index_name: &str) -> bool {
    conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='index' AND name=?)",
        [index_name],
        |row| row.get::<_, bool>(0),
    )
    .unwrap()
}

/// 验证触发器是否存在
pub fn trigger_exists(conn: &Connection, trigger_name: &str) -> bool {
    conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='trigger' AND name=?)",
        [trigger_name],
        |row| row.get::<_, bool>(0),
    )
    .unwrap()
}

