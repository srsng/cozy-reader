use serde::{Deserialize, Serialize};
use thiserror::Error;
use ts_rs::TS;

#[derive(Error, Debug, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/DatabaseError.ts"
)]
pub enum DatabaseError {
    #[error("资源不存在: {0}")]
    NotFound(String),

    #[error("验证错误: {0}")]
    ValidationError(String),

    #[error("数据库错误: {0}")]
    DatabaseError(String),

    #[error("约束违反: {0}")]
    ConstraintViolation(String),
}

impl From<sea_orm::DbErr> for DatabaseError {
    fn from(err: sea_orm::DbErr) -> Self {
        DatabaseError::DatabaseError(err.to_string())
    }
}
