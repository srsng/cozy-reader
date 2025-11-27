use crate::error::DatabaseError;
use sea_orm::{DatabaseConnection, DatabaseTransaction, TransactionTrait};
use std::future::Future;
use std::pin::Pin;

/// 在事务中执行操作
///
/// ### 参数
/// - `db`: 数据库连接
/// - `f`: 在事务中执行的异步闭包
///
/// ### 返回
/// - 成功时返回操作结果
/// - 失败时自动回滚事务并返回错误
pub async fn with_transaction<T, F>(db: &DatabaseConnection, f: F) -> Result<T, DatabaseError>
where
    F: for<'a> FnOnce(
        &'a DatabaseTransaction,
    ) -> Pin<Box<dyn Future<Output = Result<T, DatabaseError>> + Send + 'a>>,
{
    let txn = db.begin().await?;
    match f(&txn).await {
        Ok(result) => {
            txn.commit().await?;
            Ok(result)
        }
        Err(e) => {
            txn.rollback().await?;
            Err(e)
        }
    }
}
