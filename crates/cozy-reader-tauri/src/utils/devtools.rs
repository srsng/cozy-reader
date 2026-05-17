#[tauri::command]
pub fn devtools_available() -> bool {
    cfg!(debug_assertions)
}

#[cfg(debug_assertions)]
#[tauri::command]
pub fn open_main_window_devtools(window: tauri::WebviewWindow) -> Result<(), String> {
    window.open_devtools();
    Ok(())
}

#[cfg(not(debug_assertions))]
#[tauri::command]
pub fn open_main_window_devtools(_window: tauri::WebviewWindow) -> Result<(), String> {
    Err("DevTools is only available in debug builds".to_string())
}
