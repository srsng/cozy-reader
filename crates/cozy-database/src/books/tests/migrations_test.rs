use rusqlite::Connection;
use sea_orm::{ConnectionTrait, Database};
use tempfile::NamedTempFile;

/// 执行 SQL 迁移的辅助函数
/// 使用 rusqlite 的 execute_batch 来处理多语句 SQL（包括 BEGIN...END 块）
fn execute_migration_with_rusqlite(db_path: &str) {
    let sql = include_str!("../migrations/m001_initial_schema.sql");

    // 移除注释行
    let cleaned_sql: String = sql
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !trimmed.starts_with("--") && !trimmed.is_empty()
        })
        .collect::<Vec<_>>()
        .join("\n");

    // 使用 rusqlite 的 execute_batch 执行 SQL（它能正确处理 BEGIN...END 块）
    let conn = Connection::open(db_path).unwrap();
    conn.execute_batch(&cleaned_sql)
        .expect("Failed to execute SQL");
}

/// 测试迁移可以正确执行（直接执行 SQL）
#[tokio::test]
async fn test_migration_execution() {
    // 创建临时文件数据库（这样 rusqlite 和 sea-orm 可以共享）
    let temp_file = NamedTempFile::new().unwrap();
    let db_path = temp_file.path().to_str().unwrap();

    // 使用 rusqlite 执行 SQL 迁移
    execute_migration_with_rusqlite(db_path);

    // 使用 sea-orm 连接到同一个数据库文件
    let db_url = format!("sqlite:{}", db_path);
    let db = Database::connect(&db_url).await.unwrap();

    // 验证表已创建（使用 SQL 查询）
    let stmt = sea_orm::Statement::from_string(
        sea_orm::DatabaseBackend::Sqlite,
        r#"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('books', 'comments', 'reading_sessions')"#.to_string(),
    );
    let result = db.query_all(stmt).await.unwrap();
    assert_eq!(result.len(), 3, "All three tables should exist");
}

/// 测试迁移的幂等性（可以重复执行）
#[tokio::test]
async fn test_migration_idempotency() {
    // 创建临时文件数据库
    let temp_file = NamedTempFile::new().unwrap();
    let db_path = temp_file.path().to_str().unwrap();

    // 第一次执行
    execute_migration_with_rusqlite(db_path);

    // 第二次执行（应该也能成功，因为使用了 IF NOT EXISTS）
    execute_migration_with_rusqlite(db_path);

    // 使用 sea-orm 连接到同一个数据库文件
    let db_url = format!("sqlite:{}", db_path);
    let db = Database::connect(&db_url).await.unwrap();

    // 验证表仍然存在
    let stmt = sea_orm::Statement::from_string(
        sea_orm::DatabaseBackend::Sqlite,
        r#"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('books', 'comments', 'reading_sessions')"#.to_string(),
    );
    let result = db.query_all(stmt).await.unwrap();
    assert_eq!(
        result.len(),
        3,
        "All three tables should still exist after second execution"
    );
}
