#[tauri::command]
async fn read_markdown_file(path: String) -> Result<String, String> {
    // 使用 tokio 异步读取文件
    match tokio::fs::read_to_string(&path).await {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("读取文件失败: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    let devtools = tauri_plugin_devtools::init();

    let mut builder = tauri::Builder::default();

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(devtools)
        // .plugin(tauri_plugin_log::Builder::new().build());
    }

    // #[cfg(desktop)]
    // {
    //     builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
    //         let _ = app
    //             .get_webview_window("main")
    //             .expect("no main window")
    //             .set_focus();
    //     }));
    // }

    builder
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_markdown_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
