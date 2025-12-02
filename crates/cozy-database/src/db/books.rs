use crate::config::DatabaseDefinition;
use tauri_plugin_sql::{Migration, MigrationKind};

/// books 数据库的所有迁移
pub fn books_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 0,
            description: "init_schema",
            sql: include_str!("../../../../packages/database/drizzle/books/migrations/0000_init_schema.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

/// books 数据库定义
pub const BOOKS_DEFINITION: DatabaseDefinition = DatabaseDefinition {
    name: "books",
    filename: "books.db",
    wal: true,
    migrations: books_migrations,
};
