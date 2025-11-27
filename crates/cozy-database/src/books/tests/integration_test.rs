use crate::books::entities::{books, comments, reading_sessions};
use crate::{BooksStatus, CommentType};
use sea_orm::prelude::Decimal;
use sea_orm::{ColumnTrait, Database, EntityTrait, QueryFilter, Set};

use rusqlite::Connection;
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

/// 集成测试：完整的 CRUD 流程
#[tokio::test]
async fn test_full_crud_workflow() {
    // 创建临时文件数据库（这样 rusqlite 和 sea-orm 可以共享）
    let temp_file = NamedTempFile::new().unwrap();
    let db_path = temp_file.path().to_str().unwrap();

    // 使用 rusqlite 执行 SQL 迁移
    execute_migration_with_rusqlite(db_path);

    // 使用 sea-orm 连接到同一个数据库文件
    let db_url = format!("sqlite:{}", db_path);
    let db = Database::connect(&db_url).await.unwrap();

    // 创建 Book
    let book = books::ActiveModel {
        path: Set("/test/book.epub".to_string()),
        title: Set("Test Book".to_string()),
        author: Set(Some("Test Author".to_string())),
        format: Set("epub".to_string()),
        storage_type: Set("filesystem".to_string()),
        added_at: Set(1234567890),
        current_progress: Set(r#"{"chapter": 1}"#.to_string()),
        total_characters: Set(100000),
        read_characters: Set(0),
        reading_time_minutes: Set(Decimal::ZERO),
        file_size: Set(1024000),
        status: Set(BooksStatus::NotStarted),
        tags: Set(r#"[]"#.to_string()),
        created_at: Set(1234567890),
        updated_at: Set(1234567890),
        ..Default::default()
    };

    let insert_result = books::Entity::insert(book).exec(&db).await;
    assert!(insert_result.is_ok(), "Should insert book successfully");

    let book_id = insert_result.unwrap().last_insert_id;

    // 读取 Book
    let found_book = books::Entity::find_by_id(book_id).one(&db).await.unwrap();

    assert!(found_book.is_some(), "Should find the book");
    let book = found_book.unwrap();
    assert_eq!(book.title, "Test Book");
    assert_eq!(book.path, "/test/book.epub");

    // 更新 Book
    let mut book: books::ActiveModel = book.into();
    book.title = Set("Updated Book Title".to_string());
    book.status = Set(BooksStatus::Reading);

    let update_result = books::Entity::update(book).exec(&db).await;
    assert!(update_result.is_ok(), "Should update book successfully");

    // 验证更新
    let updated_book = books::Entity::find_by_id(book_id)
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated_book.title, "Updated Book Title");
    assert_eq!(updated_book.status, BooksStatus::Reading);

    // 创建 Comment
    let comment = comments::ActiveModel {
        book_id: Set(book_id),
        content: Set("This is a great book!".to_string()),
        comment_type: Set(CommentType::Note),
        color: Set(Some("#ffeb3b".to_string())),
        tags: Set(Some(r#"[]"#.to_string())),
        is_private: Set(Some(false)),
        created_at: Set(1234567890),
        updated_at: Set(1234567890),
        ..Default::default()
    };

    let comment_result = comments::Entity::insert(comment).exec(&db).await;
    assert!(comment_result.is_ok(), "Should insert comment successfully");

    // 创建 ReadingSession
    let session = reading_sessions::ActiveModel {
        book_id: Set(book_id),
        start_time: Set(1234567890),
        duration_minutes: Set(Some(30)),
        characters_read: Set(Some(5000)),
        created_at: Set(1234567890),
        ..Default::default()
    };

    let session_result = reading_sessions::Entity::insert(session).exec(&db).await;
    assert!(
        session_result.is_ok(),
        "Should insert reading session successfully"
    );

    // 测试关系查询：通过 Book 查找 Comments
    let book_with_comments = books::Entity::find_by_id(book_id)
        .find_with_related(comments::Entity)
        .all(&db)
        .await
        .unwrap();

    assert_eq!(book_with_comments.len(), 1_usize);
    let (book, comments_vec) = &book_with_comments[0];
    assert_eq!(book.id, book_id);
    assert_eq!(comments_vec.len(), 1_usize);

    // 删除 Book（应该级联删除 Comments 和 ReadingSessions）
    books::Entity::delete_by_id(book_id)
        .exec(&db)
        .await
        .unwrap();

    // 验证级联删除
    let remaining_comments = comments::Entity::find()
        .filter(comments::Column::BookId.eq(book_id))
        .all(&db)
        .await
        .unwrap();
    assert_eq!(
        remaining_comments.len(),
        0,
        "Comments should be cascade deleted"
    );

    let remaining_sessions = reading_sessions::Entity::find()
        .filter(reading_sessions::Column::BookId.eq(book_id))
        .all(&db)
        .await
        .unwrap();
    assert_eq!(
        remaining_sessions.len(),
        0,
        "Reading sessions should be cascade deleted"
    );
}

/// 测试关系查询
#[tokio::test]
async fn test_relationship_queries() {
    // 创建临时文件数据库
    let temp_file = NamedTempFile::new().unwrap();
    let db_path = temp_file.path().to_str().unwrap();

    // 使用 rusqlite 执行 SQL 迁移
    execute_migration_with_rusqlite(db_path);

    // 使用 sea-orm 连接到同一个数据库文件
    let db_url = format!("sqlite:{}", db_path);
    let db = Database::connect(&db_url).await.unwrap();

    // 创建 Book
    let book = books::ActiveModel {
        path: Set("/test/book.epub".to_string()),
        title: Set("Test Book".to_string()),
        format: Set("epub".to_string()),
        storage_type: Set("filesystem".to_string()),
        added_at: Set(1234567890),
        current_progress: Set(r#"{}"#.to_string()),
        total_characters: Set(100000),
        read_characters: Set(0),
        reading_time_minutes: Set(Decimal::ZERO),
        file_size: Set(1024000),
        status: Set(BooksStatus::NotStarted),
        tags: Set(r#"[]"#.to_string()),
        created_at: Set(1234567890),
        updated_at: Set(1234567890),
        ..Default::default()
    };

    let book_id = books::Entity::insert(book)
        .exec(&db)
        .await
        .unwrap()
        .last_insert_id;

    // 创建多个 Comments
    for i in 0..3 {
        let comment = comments::ActiveModel {
            book_id: Set(book_id),
            content: Set(format!("Comment {}", i)),
            comment_type: Set(CommentType::Note),
            color: Set(Some("#ffeb3b".to_string())),
            tags: Set(Some(r#"[]"#.to_string())),
            is_private: Set(Some(false)),
            created_at: Set(1234567890 + i),
            updated_at: Set(1234567890 + i),
            ..Default::default()
        };
        comments::Entity::insert(comment).exec(&db).await.unwrap();
    }

    // 通过 Book 查找所有 Comments
    let comments = comments::Entity::find()
        .filter(comments::Column::BookId.eq(book_id))
        .all(&db)
        .await
        .unwrap();

    assert_eq!(comments.len(), 3, "Should find all 3 comments");
}
