use chrono::Utc;
use sea_orm::prelude::Decimal;
use sea_orm::ActiveEnum;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QuerySelect, Set,
};

use crate::books::enums::BooksStatus;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::books::entities::books;
use crate::error::DatabaseError;
use crate::transaction::with_transaction;

/// 创建书籍输入
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/book/createBookInput.ts"
)]
pub struct CreateBookInput {
    pub path: String,
    pub title: String,
    pub author: Option<String>,
    pub format: String,
    pub cover: Option<String>,
    pub storage_type: String,
    pub current_progress: Option<String>,
    pub total_characters: Option<i32>,
    pub read_characters: Option<i32>,
    pub reading_time_minutes: Option<f64>,
    pub file_size: Option<i32>,
    pub status: Option<String>,
    pub tags: Option<String>,
    pub rating: Option<f64>,
    pub notes: Option<String>,
}

/// 更新书籍输入
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/book/updateBookInput.ts"
)]
pub struct UpdateBookInput {
    pub id: i32,
    pub title: Option<String>,
    pub author: Option<String>,
    pub format: Option<String>,
    pub cover: Option<String>,
    pub storage_type: Option<String>,
    pub current_progress: Option<String>,
    pub total_characters: Option<i32>,
    pub read_characters: Option<i32>,
    pub reading_time_minutes: Option<f64>,
    pub file_size: Option<i32>,
    pub status: Option<String>,
    pub tags: Option<String>,
    pub rating: Option<f64>,
    pub notes: Option<String>,
    pub last_read_at: Option<i64>,
}

/// 书籍过滤器
#[derive(Debug, Default, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/book/bookFilters.ts"
)]
pub struct BookFilters {
    pub status: Option<String>,
    pub author: Option<String>,
    pub search: Option<String>, // 搜索标题或作者
    pub tags: Option<Vec<String>>,
    pub deleted: Option<bool>, // false = 只查询未删除的
}

/// 分页参数
#[derive(Debug, Default, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../packages/database/src/types/generated/books/inputs/book/pagination.ts"
)]
pub struct Pagination {
    pub page: Option<u64>,
    pub page_size: Option<u64>,
}

/// 书籍服务
pub struct BookService;

impl BookService {
    /// 创建书籍
    pub async fn create(
        db: &DatabaseConnection,
        input: CreateBookInput,
    ) -> Result<books::Model, DatabaseError> {
        let now = Utc::now().timestamp() as i32;
        let book = books::ActiveModel {
            path: Set(input.path),
            title: Set(input.title),
            author: Set(input.author),
            format: Set(input.format),
            cover: Set(input.cover),
            storage_type: Set(input.storage_type),
            current_progress: Set(input.current_progress.unwrap_or_else(|| "{}".to_string())),
            total_characters: Set(input.total_characters.unwrap_or(0)),
            read_characters: Set(input.read_characters.unwrap_or(0)),
            reading_time_minutes: Set(Decimal::try_from(input.reading_time_minutes.unwrap_or(0.0))
                .unwrap_or(Decimal::ZERO)),
            file_size: Set(input.file_size.unwrap_or(0)),
            status: Set(input
                .status
                .and_then(|s| <BooksStatus as ActiveEnum>::try_from_value(&s).ok())
                .unwrap_or(BooksStatus::NotStarted)),
            tags: Set(input.tags.unwrap_or_else(|| "[]".to_string())),
            rating: Set(input
                .rating
                .map(|r| Decimal::try_from(r).unwrap_or(Decimal::ZERO))),
            notes: Set(input.notes),
            added_at: Set(now),
            created_at: Set(now),
            updated_at: Set(now),
            last_read_at: Set(None),
            deleted_at: Set(None),
            ..Default::default()
        };

        book.insert(db).await.map_err(DatabaseError::from)
    }

    /// 根据 ID 获取书籍
    pub async fn get_by_id(
        db: &DatabaseConnection,
        id: i32,
    ) -> Result<Option<books::Model>, DatabaseError> {
        books::Entity::find_by_id(id)
            .one(db)
            .await
            .map_err(DatabaseError::from)
    }

    /// 列表查询书籍
    pub async fn list(
        db: &DatabaseConnection,
        filters: BookFilters,
        pagination: Option<Pagination>,
    ) -> Result<Vec<books::Model>, DatabaseError> {
        let mut query = books::Entity::find();

        // 应用过滤器
        if let Some(status) = filters.status {
            query = query.filter(books::Column::Status.eq(status));
        }

        if let Some(author) = filters.author {
            query = query.filter(books::Column::Author.eq(author));
        }

        if let Some(search) = filters.search {
            query = query.filter(
                books::Column::Title
                    .contains(&search)
                    .or(books::Column::Author.contains(&search)),
            );
        }

        // 软删除过滤
        if let Some(deleted) = filters.deleted {
            if !deleted {
                query = query.filter(books::Column::DeletedAt.is_null());
            }
        } else {
            // 默认只查询未删除的
            query = query.filter(books::Column::DeletedAt.is_null());
        }

        // 应用分页
        if let Some(p) = pagination {
            let page = p.page.unwrap_or(1);
            let page_size = p.page_size.unwrap_or(20);
            let offset = (page - 1) * page_size;
            query = query.limit(page_size).offset(offset);
        }

        query.all(db).await.map_err(DatabaseError::from)
    }

    /// 更新书籍
    pub async fn update(
        db: &DatabaseConnection,
        input: UpdateBookInput,
    ) -> Result<books::Model, DatabaseError> {
        let book = books::Entity::find_by_id(input.id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("书籍不存在: {}", input.id)))?;

        let mut book: books::ActiveModel = book.into();
        let now = Utc::now().timestamp() as i32;

        if let Some(title) = input.title {
            book.title = Set(title);
        }
        if let Some(author) = input.author {
            book.author = Set(Some(author));
        }
        if let Some(format) = input.format {
            book.format = Set(format);
        }
        if let Some(cover) = input.cover {
            book.cover = Set(Some(cover));
        }
        if let Some(storage_type) = input.storage_type {
            book.storage_type = Set(storage_type);
        }
        if let Some(current_progress) = input.current_progress {
            book.current_progress = Set(current_progress);
        }
        if let Some(total_characters) = input.total_characters {
            book.total_characters = Set(total_characters);
        }
        if let Some(read_characters) = input.read_characters {
            book.read_characters = Set(read_characters);
        }
        if let Some(reading_time_minutes) = input.reading_time_minutes {
            book.reading_time_minutes =
                Set(Decimal::try_from(reading_time_minutes).unwrap_or(Decimal::ZERO));
        }
        if let Some(file_size) = input.file_size {
            book.file_size = Set(file_size);
        }
        if let Some(status) = input.status {
            if let Ok(status_enum) = BooksStatus::try_from_value(&status) {
                book.status = Set(status_enum);
            }
        }
        if let Some(tags) = input.tags {
            book.tags = Set(tags);
        }
        if let Some(rating) = input.rating {
            book.rating = Set(Some(Decimal::try_from(rating).unwrap_or(Decimal::ZERO)));
        }
        if let Some(notes) = input.notes {
            book.notes = Set(Some(notes));
        }
        if let Some(last_read_at) = input.last_read_at {
            book.last_read_at = Set(Some(last_read_at as i32));
        }

        book.updated_at = Set(now);

        book.update(db).await.map_err(DatabaseError::from)
    }

    /// 软删除书籍
    pub async fn soft_delete(db: &DatabaseConnection, id: i32) -> Result<(), DatabaseError> {
        let book = books::Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("书籍不存在: {}", id)))?;

        let mut book: books::ActiveModel = book.into();
        book.deleted_at = Set(Some(Utc::now().timestamp() as i32));

        book.update(db).await?;
        Ok(())
    }

    /// 硬删除书籍（物理删除，需要事务，级联删除相关数据）
    pub async fn hard_delete(db: &DatabaseConnection, id: i32) -> Result<(), DatabaseError> {
        use crate::books::entities::{comments, reading_sessions};

        with_transaction(db, |txn| {
            Box::pin(async move {
                // 级联删除相关数据
                comments::Entity::delete_many()
                    .filter(comments::Column::BookId.eq(id))
                    .exec(txn)
                    .await?;

                reading_sessions::Entity::delete_many()
                    .filter(reading_sessions::Column::BookId.eq(id))
                    .exec(txn)
                    .await?;

                books::Entity::delete_by_id(id).exec(txn).await?;

                Ok(())
            })
        })
        .await
    }

    /// 恢复书籍（清除 deleted_at）
    pub async fn restore(db: &DatabaseConnection, id: i32) -> Result<books::Model, DatabaseError> {
        let book = books::Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or_else(|| DatabaseError::NotFound(format!("书籍不存在: {}", id)))?;

        let mut book: books::ActiveModel = book.into();
        book.deleted_at = Set(None);
        book.updated_at = Set(Utc::now().timestamp() as i32);

        book.update(db).await.map_err(DatabaseError::from)
    }
}
