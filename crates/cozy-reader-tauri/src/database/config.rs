use tauri_plugin_sql::Migration;

/// 数据库定义结构体
pub struct DatabaseDefinition {
    /// 数据库名称（如 "books"）
    pub name: &'static str,
    /// 数据库文件名（如 "books.db"）
    pub filename: &'static str,
    /// 是否启用 WAL 模式
    pub wal: bool,
    /// 迁移函数
    pub migrations: fn() -> Vec<Migration>,
}

/// 所有数据库定义
pub const DATABASES: &[DatabaseDefinition] = &[
    DatabaseDefinition {
        name: "books",
        filename: "books.db",
        wal: true,
        migrations: crate::database::migrations::books_migrations,
    },
    // 未来添加新数据库时，只需在这里添加一条记录
];
