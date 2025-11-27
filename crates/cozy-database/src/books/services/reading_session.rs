use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::books::entities::reading_sessions;
use crate::error::DatabaseError;

/// 创建阅读会话输入
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/readingSession/createReadingSessionInput.ts"
)]
pub struct CreateReadingSessionInput {
    pub book_id: i32,
    pub start_time: Option<i64>,
    pub end_time: Option<i64>,
    pub duration_minutes: Option<i32>,
    pub start_progress: Option<String>,
    pub end_progress: Option<String>,
    pub characters_read: Option<i32>,
}

/// 更新阅读会话输入
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/readingSession/updateReadingSessionInput.ts"
)]
pub struct UpdateReadingSessionInput {
    pub id: i32,
    pub end_time: Option<i64>,
    pub duration_minutes: Option<i32>,
    pub end_progress: Option<String>,
    pub characters_read: Option<i32>,
}

/// 阅读会话服务
pub struct ReadingSessionService;

impl ReadingSessionService {
    /// 创建阅读会话
    pub async fn create(
        db: &DatabaseConnection,
        input: CreateReadingSessionInput,
    ) -> Result<reading_sessions::Model, DatabaseError> {
        let now = Utc::now().timestamp() as i32;
        let session = reading_sessions::ActiveModel {
            book_id: Set(input.book_id),
            start_time: Set(input.start_time.map(|t| t as i32).unwrap_or(now)),
            end_time: Set(input.end_time.map(|t| t as i32)),
            duration_minutes: Set(input.duration_minutes.or(Some(0))),
            start_progress: Set(input.start_progress),
            end_progress: Set(input.end_progress),
            characters_read: Set(input.characters_read.or(Some(0))),
            created_at: Set(now),
            deleted_at: Set(None),
            ..Default::default()
        };

        session.insert(db).await.map_err(DatabaseError::from)
    }

    /// 根据 ID 获取阅读会话
    pub async fn get_by_id(
        db: &DatabaseConnection,
        id: i32,
    ) -> Result<Option<reading_sessions::Model>, DatabaseError> {
        reading_sessions::Entity::find_by_id(id)
            .one(db)
            .await
            .map_err(DatabaseError::from)
    }

    /// 根据书籍 ID 列表查询阅读会话
    pub async fn list_by_book_id(
        db: &DatabaseConnection,
        book_id: i32,
    ) -> Result<Vec<reading_sessions::Model>, DatabaseError> {
        reading_sessions::Entity::find()
            .filter(reading_sessions::Column::BookId.eq(book_id))
            .filter(reading_sessions::Column::DeletedAt.is_null())
            .all(db)
            .await
            .map_err(DatabaseError::from)
    }

    /// 更新阅读会话
    pub async fn update(
        db: &DatabaseConnection,
        input: UpdateReadingSessionInput,
    ) -> Result<reading_sessions::Model, DatabaseError> {
        let session = reading_sessions::Entity::find_by_id(input.id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("阅读会话不存在: {}", input.id)))?;

        let mut session: reading_sessions::ActiveModel = session.into();

        if let Some(end_time) = input.end_time {
            session.end_time = Set(Some(end_time as i32));
        }
        if let Some(duration_minutes) = input.duration_minutes {
            session.duration_minutes = Set(Some(duration_minutes));
        }
        if let Some(end_progress) = input.end_progress {
            session.end_progress = Set(Some(end_progress));
        }
        if let Some(characters_read) = input.characters_read {
            session.characters_read = Set(Some(characters_read));
        }

        session.update(db).await.map_err(DatabaseError::from)
    }

    /// 软删除阅读会话
    pub async fn soft_delete(db: &DatabaseConnection, id: i32) -> Result<(), DatabaseError> {
        let session = reading_sessions::Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("阅读会话不存在: {}", id)))?;

        let mut session: reading_sessions::ActiveModel = session.into();
        session.deleted_at = Set(Some(Utc::now().timestamp() as i32));

        session.update(db).await?;
        Ok(())
    }

    /// 硬删除阅读会话（物理删除）
    pub async fn hard_delete(db: &DatabaseConnection, id: i32) -> Result<(), DatabaseError> {
        reading_sessions::Entity::delete_by_id(id)
            .exec(db)
            .await
            .map_err(DatabaseError::from)?;
        Ok(())
    }

    /// 恢复阅读会话（清除 deleted_at）
    pub async fn restore(
        db: &DatabaseConnection,
        id: i32,
    ) -> Result<reading_sessions::Model, DatabaseError> {
        let session = reading_sessions::Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("阅读会话不存在: {}", id)))?;

        let mut session: reading_sessions::ActiveModel = session.into();
        session.deleted_at = Set(None);

        session.update(db).await.map_err(DatabaseError::from)
    }
}
