mod utils;

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
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(utils::database::build_database_sql_plugin())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            utils::fs::read_file_to_string,
            utils::fs::fs_exists,
            utils::database::get_database_configs,
            utils::fs::get_file_info,
            utils::devtools::devtools_available,
            utils::devtools::open_main_window_devtools,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
