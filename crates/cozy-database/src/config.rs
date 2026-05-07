use serde::{Deserialize, Serialize};
use tauri_plugin_sql::Migration;
use ts_rs::TS;

/// 数据库名称枚举
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../../packages/database/src/core/types/generated/DatabaseName.ts"
)]
pub enum DatabaseName {
    #[serde(rename = "books")]
    Books,
    // 未来添加新数据库时，必须同时更新此枚举、impl DatabaseName 和 DATABASES 数组
}

impl DatabaseName {
    /// 获取数据库名称字符串
    pub fn as_str(&self) -> &'static str {
        match self {
            DatabaseName::Books => "books",
        }
    }

    /// 获取所有数据库名称
    pub fn all() -> &'static [DatabaseName] {
        &[DatabaseName::Books]
    }
}

impl From<DatabaseName> for String {
    fn from(name: DatabaseName) -> Self {
        name.as_str().to_string()
    }
}

impl TryFrom<&str> for DatabaseName {
    type Error = String;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "books" => Ok(DatabaseName::Books),
            _ => Err(format!("Unknown database name: {}", value)),
        }
    }
}

/// 数据库定义结构体（内部使用）
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

/// 数据库配置（导出到前端）
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../../packages/database/src/core/types/generated/DatabaseConfig.ts"
)]
pub struct DatabaseConfig {
    /// 数据库名称
    pub name: DatabaseName,
    /// 数据库文件名（如 "books.db"）
    pub filename: String,
    /// 是否启用 WAL 模式
    pub wal: bool,
}

impl From<&DatabaseDefinition> for DatabaseConfig {
    fn from(db: &DatabaseDefinition) -> Self {
        DatabaseConfig {
            name: DatabaseName::try_from(db.name).unwrap_or_else(|_| {
                panic!(
                    "Database '{}' in DATABASES has no corresponding DatabaseName variant",
                    db.name
                );
            }),
            filename: db.filename.to_string(),
            wal: db.wal,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::DATABASES;

    #[test]
    fn test_database_name_matches_databases() {
        // 运行时检查：确保每个 DatabaseName 都在 DATABASES 中
        for name in DatabaseName::all() {
            let name_str = name.as_str();
            assert!(
                DATABASES.iter().any(|db| db.name == name_str),
                "DatabaseName::{:?} ('{}') not found in DATABASES",
                name,
                name_str
            );
        }
        // 确保 DATABASES 中的每个数据库都有对应的枚举值
        for db in DATABASES {
            DatabaseName::try_from(db.name).unwrap_or_else(|e| {
                panic!(
                    "Database '{}' in DATABASES has no corresponding DatabaseName: {}",
                    db.name, e
                );
            });
        }
    }
}
