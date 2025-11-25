use tauri_plugin_sql::{Migration, MigrationKind};

/// Books 数据库的所有迁移
pub fn books_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "initial_schema",
        sql: include_str!("books/001_initial_schema.sql"),
        kind: MigrationKind::Up,
    }]
}
