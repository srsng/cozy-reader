use cozy_database::{BooksStatus, DATABASES};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseConfigResponse {
    pub name: String,
    pub filename: String,
    pub wal: bool,
}

#[tauri::command]
pub fn get_database_configs() -> Vec<DatabaseConfigResponse> {
    DATABASES
        .iter()
        .map(|db| DatabaseConfigResponse {
            name: db.name.to_string(),
            filename: db.filename.to_string(),
            wal: db.wal,
        })
        .collect()
}

// MVP 测试命令：获取测试书籍
#[tauri::command]
pub async fn get_test_book(
    id: i32,
) -> Result<Option<cozy_database::books::entities::books::Model>, String> {
    // 暂时返回模拟数据用于验证类型
    use cozy_database::books::entities::books;
    Ok(Some(books::Model {
        id,
        path: "/test/book.txt".to_string(),
        title: "Test Book".to_string(),
        author: Some("Test Author".to_string()),
        format: "txt".to_string(),
        cover: None,
        storage_type: "filesystem".to_string(),
        added_at: chrono::Utc::now().timestamp() as i32,
        last_read_at: None,
        current_progress: "{}".to_string(),
        total_characters: 0,
        read_characters: 0,
        reading_time_minutes: sea_orm::prelude::Decimal::ZERO,
        file_size: 0,
        status: BooksStatus::NotStarted,
        tags: "[]".to_string(),
        rating: None,
        notes: None,
        created_at: chrono::Utc::now().timestamp() as i32,
        updated_at: chrono::Utc::now().timestamp() as i32,
        deleted_at: None,
    }))
}
