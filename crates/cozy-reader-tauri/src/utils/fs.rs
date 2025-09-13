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
