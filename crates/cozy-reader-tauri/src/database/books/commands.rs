use cozy_database::books::entities::{books, comments, reading_sessions};
use cozy_database::books::services::{
    BookFilters, BookService, CommentService, CreateBookInput, CreateCommentInput,
    CreateReadingSessionInput, Pagination, ReadingSessionService, UpdateBookInput,
    UpdateCommentInput, UpdateReadingSessionInput,
};
use sea_orm::Database;
use sea_orm::DatabaseConnection;
use tauri::{AppHandle, Manager};

/// 获取数据库连接
async fn get_db(app: AppHandle) -> Result<DatabaseConnection, String> {
    // 获取应用数据目录
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("获取应用数据目录失败: {}", e))?;

    // 确保目录存在
    std::fs::create_dir_all(&app_data_dir).map_err(|e| format!("创建应用数据目录失败: {}", e))?;

    // 构建数据库文件路径
    let db_path = app_data_dir.join("books.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

    Database::connect(&db_url)
        .await
        .map_err(|e| format!("数据库连接失败: {}", e))
}

// ==================== Book CRUD ====================

/// 创建书籍
#[tauri::command]
pub async fn create_book(app: AppHandle, input: CreateBookInput) -> Result<books::Model, String> {
    // 输入验证
    if input.path.is_empty() {
        return Err("路径不能为空".to_string());
    }
    if input.title.is_empty() {
        return Err("标题不能为空".to_string());
    }
    if input.format.is_empty() {
        return Err("格式不能为空".to_string());
    }
    if input.storage_type.is_empty() {
        return Err("存储类型不能为空".to_string());
    }

    let db = get_db(app).await?;
    BookService::create(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 获取单本书籍
#[tauri::command]
pub async fn get_book(app: AppHandle, id: i32) -> Result<Option<books::Model>, String> {
    let db = get_db(app).await?;
    BookService::get_by_id(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 列表查询书籍
#[tauri::command]
pub async fn list_books(
    app: AppHandle,
    filters: Option<BookFilters>,
    pagination: Option<Pagination>,
) -> Result<Vec<books::Model>, String> {
    let db = get_db(app).await?;
    BookService::list(&db, filters.unwrap_or_default(), pagination)
        .await
        .map_err(|e| e.to_string())
}

/// 更新书籍
#[tauri::command]
pub async fn update_book(app: AppHandle, input: UpdateBookInput) -> Result<books::Model, String> {
    let db = get_db(app).await?;
    BookService::update(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 删除书籍（软删除）
#[tauri::command]
pub async fn delete_book(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    BookService::soft_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 软删除书籍
#[tauri::command]
pub async fn soft_delete_book(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    BookService::soft_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 硬删除书籍（物理删除）
#[tauri::command]
pub async fn hard_delete_book(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    BookService::hard_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 恢复书籍
#[tauri::command]
pub async fn restore_book(app: AppHandle, id: i32) -> Result<books::Model, String> {
    let db = get_db(app).await?;
    BookService::restore(&db, id)
        .await
        .map_err(|e| e.to_string())
}

// ==================== Comment CRUD ====================

/// 创建评论
#[tauri::command]
pub async fn create_comment(
    app: AppHandle,
    input: CreateCommentInput,
) -> Result<comments::Model, String> {
    // 输入验证
    if input.content.is_empty() {
        return Err("评论内容不能为空".to_string());
    }

    let db = get_db(app).await?;
    CommentService::create(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 获取单个评论
#[tauri::command]
pub async fn get_comment(app: AppHandle, id: i32) -> Result<Option<comments::Model>, String> {
    let db = get_db(app).await?;
    CommentService::get_by_id(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 列表查询评论（按书籍ID）
#[tauri::command]
pub async fn list_comments(app: AppHandle, book_id: i32) -> Result<Vec<comments::Model>, String> {
    let db = get_db(app).await?;
    CommentService::list_by_book_id(&db, book_id)
        .await
        .map_err(|e| e.to_string())
}

/// 更新评论
#[tauri::command]
pub async fn update_comment(
    app: AppHandle,
    input: UpdateCommentInput,
) -> Result<comments::Model, String> {
    let db = get_db(app).await?;
    CommentService::update(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 删除评论（软删除）
#[tauri::command]
pub async fn delete_comment(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    CommentService::soft_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 软删除评论
#[tauri::command]
pub async fn soft_delete_comment(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    CommentService::soft_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 硬删除评论（物理删除）
#[tauri::command]
pub async fn hard_delete_comment(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    CommentService::hard_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 恢复评论
#[tauri::command]
pub async fn restore_comment(app: AppHandle, id: i32) -> Result<comments::Model, String> {
    let db = get_db(app).await?;
    CommentService::restore(&db, id)
        .await
        .map_err(|e| e.to_string())
}

// ==================== ReadingSession CRUD ====================

/// 创建阅读会话
#[tauri::command]
pub async fn create_reading_session(
    app: AppHandle,
    input: CreateReadingSessionInput,
) -> Result<reading_sessions::Model, String> {
    let db = get_db(app).await?;
    ReadingSessionService::create(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 获取单个阅读会话
#[tauri::command]
pub async fn get_reading_session(
    app: AppHandle,
    id: i32,
) -> Result<Option<reading_sessions::Model>, String> {
    let db = get_db(app).await?;
    ReadingSessionService::get_by_id(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 列表查询阅读会话（按书籍ID）
#[tauri::command]
pub async fn list_reading_sessions(
    app: AppHandle,
    book_id: i32,
) -> Result<Vec<reading_sessions::Model>, String> {
    let db = get_db(app).await?;
    ReadingSessionService::list_by_book_id(&db, book_id)
        .await
        .map_err(|e| e.to_string())
}

/// 更新阅读会话
#[tauri::command]
pub async fn update_reading_session(
    app: AppHandle,
    input: UpdateReadingSessionInput,
) -> Result<reading_sessions::Model, String> {
    let db = get_db(app).await?;
    ReadingSessionService::update(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 删除阅读会话（软删除）
#[tauri::command]
pub async fn delete_reading_session(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    ReadingSessionService::soft_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 软删除阅读会话
#[tauri::command]
pub async fn soft_delete_reading_session(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    ReadingSessionService::soft_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 硬删除阅读会话（物理删除）
#[tauri::command]
pub async fn hard_delete_reading_session(app: AppHandle, id: i32) -> Result<(), String> {
    let db = get_db(app).await?;
    ReadingSessionService::hard_delete(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 恢复阅读会话
#[tauri::command]
pub async fn restore_reading_session(
    app: AppHandle,
    id: i32,
) -> Result<reading_sessions::Model, String> {
    let db = get_db(app).await?;
    ReadingSessionService::restore(&db, id)
        .await
        .map_err(|e| e.to_string())
}
