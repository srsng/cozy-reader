use crate::{
    books::entities::{books, comments, reading_sessions},
    BooksStatus, CommentType,
};
use sea_orm::prelude::Decimal;

/// 测试 BookEntity 序列化/反序列化
#[test]
fn test_books_serialization() {
    use serde_json;

    let book = books::Model {
        id: 1,
        path: "/path/to/book".to_string(),
        title: "Test Book".to_string(),
        author: Some("Test Author".to_string()),
        format: "epub".to_string(),
        cover: None,
        storage_type: "filesystem".to_string(),
        added_at: 1234567890,
        last_read_at: Some(1234567900),
        current_progress: r#"{"chapter": 1, "page": 10}"#.to_string(),
        total_characters: 100000,
        read_characters: 50000,
        reading_time_minutes: Decimal::try_from(1205).unwrap() / Decimal::from(10),
        file_size: 1024000,
        status: BooksStatus::Reading,
        tags: r#"["fiction", "sci-fi"]"#.to_string(),
        rating: Some(Decimal::try_from(45).unwrap() / Decimal::from(10)),
        notes: Some("Great book!".to_string()),
        created_at: 1234567890,
        updated_at: 1234567890,
        deleted_at: None,
    };

    // 测试序列化
    let json = serde_json::to_string(&book).unwrap();
    assert!(!json.is_empty());

    // 测试反序列化
    let deserialized: books::Model = serde_json::from_str(&json).unwrap();
    assert_eq!(book.id, deserialized.id);
    assert_eq!(book.title, deserialized.title);
}

/// 测试 CommentEntity 序列化/反序列化
#[test]
fn test_comments_serialization() {
    use serde_json;

    let comment = comments::Model {
        id: 1,
        book_id: 1,
        content: "This is a great book!".to_string(),
        comment_type: CommentType::Note,
        position_info: Some(r#"{"chapter": 1, "page": 10}"#.to_string()),
        selected_text: Some("selected text".to_string()),
        color: Some("#ffeb3b".to_string()),
        tags: Some(r#"["important"]"#.to_string()),
        is_private: Some(false),
        created_at: 1234567890,
        updated_at: 1234567890,
        deleted_at: None,
    };

    let json = serde_json::to_string(&comment).unwrap();
    let deserialized: comments::Model = serde_json::from_str(&json).unwrap();
    assert_eq!(comment.id, deserialized.id);
    assert_eq!(comment.content, deserialized.content);
}

/// 测试 ReadingSessionEntity 序列化/反序列化
#[test]
fn test_reading_sessions_serialization() {
    use serde_json;

    let session = reading_sessions::Model {
        id: 1,
        book_id: 1,
        start_time: 1234567890,
        end_time: Some(1234568000),
        duration_minutes: Some(10),
        start_progress: Some(r#"{"chapter": 1, "page": 10}"#.to_string()),
        end_progress: Some(r#"{"chapter": 1, "page": 20}"#.to_string()),
        characters_read: Some(5000),
        created_at: 1234567890,
        deleted_at: None,
    };

    let json = serde_json::to_string(&session).unwrap();
    let deserialized: reading_sessions::Model = serde_json::from_str(&json).unwrap();
    assert_eq!(session.id, deserialized.id);
    assert_eq!(session.book_id, deserialized.book_id);
}

/// 测试 JSON 字段处理
#[test]
fn test_json_field_handling() {
    let book = books::Model {
        id: 1,
        path: "/path/to/book".to_string(),
        title: "Test Book".to_string(),
        author: None,
        format: "epub".to_string(),
        cover: None,
        storage_type: "filesystem".to_string(),
        added_at: 1234567890,
        last_read_at: None,
        current_progress: r#"{"chapter": 1, "page": 10}"#.to_string(),
        total_characters: 100000,
        read_characters: 50000,
        reading_time_minutes: Decimal::try_from(1205).unwrap() / Decimal::from(10),
        file_size: 1024000,
        status: BooksStatus::Reading,
        tags: r#"["fiction", "sci-fi"]"#.to_string(),
        rating: None,
        notes: None,
        created_at: 1234567890,
        updated_at: 1234567890,
        deleted_at: None,
    };

    // 测试 tags JSON 解析
    let tags: Vec<String> = serde_json::from_str(&book.tags).unwrap();
    assert_eq!(tags.len(), 2);
    assert_eq!(tags[0], "fiction");

    // 测试 current_progress JSON 解析
    let progress: serde_json::Value = serde_json::from_str(&book.current_progress).unwrap();
    assert_eq!(progress["chapter"], 1);
}
