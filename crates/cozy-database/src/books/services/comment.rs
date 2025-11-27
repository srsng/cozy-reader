use chrono::Utc;
use sea_orm::{
    ActiveEnum, ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set,
};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::books::entities::comments;
use crate::books::enums::CommentType;
use crate::error::DatabaseError;

/// 创建评论输入
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/comment/createCommentInput.ts"
)]
pub struct CreateCommentInput {
    pub book_id: i32,
    pub content: String,
    pub comment_type: Option<String>,
    pub position_info: Option<String>,
    pub selected_text: Option<String>,
    pub color: Option<String>,
    pub tags: Option<String>,
    pub is_private: Option<bool>,
}

/// 更新评论输入
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/comment/updateCommentInput.ts"
)]
pub struct UpdateCommentInput {
    pub id: i32,
    pub content: Option<String>,
    pub comment_type: Option<String>,
    pub position_info: Option<String>,
    pub selected_text: Option<String>,
    pub color: Option<String>,
    pub tags: Option<String>,
    pub is_private: Option<bool>,
}

/// 评论服务
pub struct CommentService;

impl CommentService {
    /// 创建评论
    pub async fn create(
        db: &DatabaseConnection,
        input: CreateCommentInput,
    ) -> Result<comments::Model, DatabaseError> {
        let now = Utc::now().timestamp() as i32;
        let comment = comments::ActiveModel {
            book_id: Set(input.book_id),
            content: Set(input.content),
            comment_type: Set(input
                .comment_type
                .and_then(|s| CommentType::try_from_value(&s).ok())
                .unwrap_or(CommentType::Note)),
            position_info: Set(input.position_info),
            selected_text: Set(input.selected_text),
            color: Set(input.color.or(Some("#ffeb3b".to_string()))),
            tags: Set(input.tags.or(Some("[]".to_string()))),
            is_private: Set(input.is_private.or(Some(true))),
            created_at: Set(now),
            updated_at: Set(now),
            deleted_at: Set(None),
            ..Default::default()
        };

        comment.insert(db).await.map_err(DatabaseError::from)
    }

    /// 根据 ID 获取评论
    pub async fn get_by_id(
        db: &DatabaseConnection,
        id: i32,
    ) -> Result<Option<comments::Model>, DatabaseError> {
        comments::Entity::find_by_id(id)
            .one(db)
            .await
            .map_err(DatabaseError::from)
    }

    /// 根据书籍 ID 列表查询评论
    pub async fn list_by_book_id(
        db: &DatabaseConnection,
        book_id: i32,
    ) -> Result<Vec<comments::Model>, DatabaseError> {
        comments::Entity::find()
            .filter(comments::Column::BookId.eq(book_id))
            .filter(comments::Column::DeletedAt.is_null())
            .all(db)
            .await
            .map_err(DatabaseError::from)
    }

    /// 更新评论
    pub async fn update(
        db: &DatabaseConnection,
        input: UpdateCommentInput,
    ) -> Result<comments::Model, DatabaseError> {
        let comment = comments::Entity::find_by_id(input.id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("评论不存在: {}", input.id)))?;

        let mut comment: comments::ActiveModel = comment.into();
        let now = Utc::now().timestamp() as i32;

        if let Some(content) = input.content {
            comment.content = Set(content);
        }
        if let Some(comment_type) = input.comment_type {
            if let Ok(comment_type_enum) = CommentType::try_from_value(&comment_type) {
                comment.comment_type = Set(comment_type_enum);
            }
        }
        if let Some(position_info) = input.position_info {
            comment.position_info = Set(Some(position_info));
        }
        if let Some(selected_text) = input.selected_text {
            comment.selected_text = Set(Some(selected_text));
        }
        if let Some(color) = input.color {
            comment.color = Set(Some(color));
        }
        if let Some(tags) = input.tags {
            comment.tags = Set(Some(tags));
        }
        if let Some(is_private) = input.is_private {
            comment.is_private = Set(Some(is_private));
        }

        comment.updated_at = Set(now);

        comment.update(db).await.map_err(DatabaseError::from)
    }

    /// 软删除评论
    pub async fn soft_delete(db: &DatabaseConnection, id: i32) -> Result<(), DatabaseError> {
        let comment = comments::Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("评论不存在: {}", id)))?;

        let mut comment: comments::ActiveModel = comment.into();
        comment.deleted_at = Set(Some(Utc::now().timestamp() as i32));

        comment.update(db).await?;
        Ok(())
    }

    /// 硬删除评论（物理删除）
    pub async fn hard_delete(db: &DatabaseConnection, id: i32) -> Result<(), DatabaseError> {
        comments::Entity::delete_by_id(id)
            .exec(db)
            .await
            .map_err(DatabaseError::from)?;
        Ok(())
    }

    /// 恢复评论（清除 deleted_at）
    pub async fn restore(
        db: &DatabaseConnection,
        id: i32,
    ) -> Result<comments::Model, DatabaseError> {
        let comment = comments::Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("评论不存在: {}", id)))?;

        let mut comment: comments::ActiveModel = comment.into();
        comment.deleted_at = Set(None);
        comment.updated_at = Set(Utc::now().timestamp() as i32);

        comment.update(db).await.map_err(DatabaseError::from)
    }
}
