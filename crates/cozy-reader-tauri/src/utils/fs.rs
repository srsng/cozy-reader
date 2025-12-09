
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[tauri::command(rename_all = "snake_case")]
pub async fn read_file_to_string(path: String) -> Result<String, String> {
    match tokio::fs::read_to_string(&path).await {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("读取文件失败: {}", e)),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn fs_exists(path: String) -> Result<bool, String> {
    match tokio::fs::try_exists(path).await {
        Err(e) => Err(format!("验证路径存在失败: {}", e)),
        Ok(b) => Ok(b),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_file_info(path: String) -> Result<FileInfo, String> {
    detect_file_format(&path)
}

/// 文件信息结构体
/// 包含文件的基本信息：路径、大小、格式、MIME类型和是否为文本文件
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../../apps/desktop/src/lib/backend/types/")]
pub struct FileInfo {
    /// 文件路径
    pub path: String,
    /// 文件大小（字节）
    pub size: u64,
    /// 检测到的文件格式（epub, pdf, txt, md, html, mobi等）
    pub format: String,
    /// MIME类型
    pub mime_type: String,
    /// 是否为文本文件
    pub is_text: bool,
}

/// 将 MIME 类型映射到项目格式
/// 支持常见的电子书格式和文本格式
fn map_mime_to_format(mime_type: &str, path: &str) -> String {
    match mime_type {
        // 电子书格式
        "application/epub+zip" => "epub".to_string(),
        "application/pdf" => "pdf".to_string(),
        "application/x-mobipocket-ebook" => "mobi".to_string(),
        "application/vnd.amazon.ebook" => "azw".to_string(),
        "application/x-fictionbook+xml" => "fb2".to_string(),
        "application/x-zip-compressed-fb2" => "fbz".to_string(),
        "application/x-cbr" => "cbr".to_string(),
        "application/x-cbz" => "cbz".to_string(),
        // 文本格式
        "text/html" => "html".to_string(),
        "text/markdown" => "md".to_string(),
        "text/plain" => {
            // 检查扩展名判断是否为 markdown
            let path_lower = path.to_lowercase();
            if path_lower.ends_with(".md") || path_lower.ends_with(".markdown") {
                "md".to_string()
            } else {
                "txt".to_string()
            }
        }
        _ => "unknown".to_string(),
    }
}

/// 检测文件格式
pub fn detect_file_format(path: &str) -> Result<FileInfo, String> {
    use std::fs::File;
    use std::io::Read;

    // 读取文件前 3KB（mimetype-detector 只需要这么多）
    let mut file = File::open(path).map_err(|e| format!("无法打开文件: {}", e))?;
    let mut buffer = vec![0u8; 3072];
    let bytes_read = file.read(&mut buffer).map_err(|e| format!("无法读取文件: {}", e))?;
    buffer.truncate(bytes_read);

    // 检测 MIME 类型
    let mime = mimetype_detector::detect(&buffer);

    // 映射到格式
    let format = map_mime_to_format(mime.mime(), path);

    // 判断是否为文本文件：MIME 类型以 "text/" 开头
    let is_text = mime.mime().starts_with("text/");

    // 获取文件大小
    let metadata = std::fs::metadata(path).map_err(|e| format!("无法获取文件元数据: {}", e))?;
    let size = metadata.len();

    Ok(FileInfo {
        path: path.to_string(),
        size,
        format,
        mime_type: mime.mime().to_string(),
        is_text,
    })
}

